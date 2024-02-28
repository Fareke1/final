const express = require('express')
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env.local' });
const secretKey = process.env.JWT_SECRET;
const router = express.Router()
const { createTask } = require('../mongodb')
const { getTask } = require('../mongodb')
const { deleteTasks } = require('../mongodb')
const { updateTask } = require('../mongodb')
const { getCompletedTask } = require('../mongodb')
const { getLoginUser } = require('../mongodb')
const { createUser } = require('../mongodb')
const { checkEmailUnique } = require('../mongodb')
const { getAllUsersDB } = require('../mongodb')
const { getUserInfoFromDatabase } = require('../mongodb')
const { getCarousel } = require('../mongodb')
const { createCarouselItem } = require('../mongodb')
const { updateCarouselItem } = require('../mongodb')
const { deleteCarouselItem } = require('../mongodb')
const { updateUser } = require('../mongodb')
const qr = require('qrcode');
const nodemailer = require('nodemailer')

async function generateToken(user) {
    const secretKey = process.env.JWT_SECRET;
    return jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });
}


function authenticate(req, res, next) {
    const token = req.headers.authorization;
    console.log(token)
    if (!token) {
        return res.status(401).json({ message: 'Token not provided' });
    }
    try {
        const decoded = jwt.verify(token, secretKey);
        console.log(decoded)
        req.userId = decoded.userId;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        return res.status(401).json({ message: 'Invalid token' });
    }
}
router.get('/protected', authenticate, (req, res) => {
    res.json({ message: 'Protected route accessed successfully' });
});


router.post('/register', async (req, res) => {
    const { name, email, password, age, country, gender,isAdmin } = req.body;

    try {   
        const isUnique = await checkEmailUnique(email);
        if (!isUnique) {
            return res.status(400).json({ message: 'Email already in use' });
        }
        const user=await createUser(name, email, password, age, country, gender,isAdmin);
        const token=await generateToken(user) 
       res.json(token)
    } catch (error) {
        console.error('Error registering user', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await getLoginUser(email); 
        if (user && user.password === password) {
            const token = jwt.sign({ email: user.email, role: user.role }, process.env.JWT_SECRET); 
            
            res.cookie('token', token, { httpOnly: true, secure: true });
          
            res.json({ message: 'Login successful', token: token });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Error logging in', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get("/users", async (req, res) => {
    try {

        const allUsers = await getAllUsersDB();
        //console.log(allUsers)
        res.json(allUsers);
    } catch (error) {

        console.error('Cannot connect to MongoDB:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get("/getUser/:email", async (req, res) => {
    try {
        const email = req.params.email; 
        const userInfo = await getUserInfoFromDatabase(email);
        if (userInfo) {
            res.json({ message: 'get user info successful', userInfo });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('error connect to db', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


//#region send mail
router.post('/send-email', (req, res) => {
    const { to, subject, message } = req.body;
    console.log(`to:${to},subject:${subject},message:${message}`)




    function getTransporter(to) {
        let transporterConfig;


        transporterConfig = {
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: 'zhanik.planet1@gmail.com',
                pass: 'frvq ruyt wfqn yimo'
            }
        };



        return nodemailer.createTransport(transporterConfig);
    }

    const transporter = getTransporter(to);

    const mailOptions = {
        from: 'zhanik.planet1@gmail.com',
        to: to,
        subject: subject,
        message: message
    };

    console.log(mailOptions)

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to send email' });
        } else {
            console.log('Email sent: ' + info.response);
            res.status(200).json({ message: 'Email sent successfully' });
        }
    });
});
//#endregion

//#region gym task list
router.get("/getTask/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const tasks = await getTask(userId);
        res.json(tasks);
    } catch (error) {
        console.error('Error when getting tasks', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.get("/getTwoTask/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        console.log(userId);
        const tasks = await getTask(userId).limit(2);
        res.json(tasks);
    } catch (error) {
        console.error('Error when getting tasks', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.get("/getCompletedTask/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        console.log(userId)
        const tasks = await getCompletedTask(userId);
        res.json(tasks);
    } catch (error) {
        console.error('Error when getting completed tasks', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.get("/getTwoCompletedTask/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        console.log(userId)
        const tasks = await getCompletedTask(userId).limit(2);
        res.json(tasks);
    } catch (error) {
        console.error('Error when getting completed tasks', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



router.get('/checkEmailUnique/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const isUnique = await checkEmailUnique(email);
        res.json({ isUnique });
    } catch (error) {
        console.error('Error while checking email uniqueness:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post("/postTask", async (req, res) => {
    try {
        const { title, content, difficulty, isCompleted, userId } = req.body
        const tasks = await createTask(title, content, difficulty, isCompleted, userId)

        res.status(200).json({ message: 'Task created succesfully' })
    }
    catch (error) {
        console.error('Error when create a task', error)
        res.status(500).json({ message: 'Internal server error' })
    }
})

router.post("/postUser", async (req, res) => {
    try {
        const { name, email, password } = req.body
        const user = await createUser(name, email, password)

        res.status(200).json({ message: 'User created sucessfully', user })
    }
    catch (error) {
        console.error('Error when creating user', error)
        res.status(500).json({ message: 'Internal server error' })
    }
})

router.delete('/deleteTask/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await deleteTasks(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error while deleting task', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.patch('/patchTask/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { isCompleted } = req.body;
        const updated = await updateTask(id, isCompleted);
        res.status(200).json({ message: 'Task updated successfully' });
    } catch (error) {
        console.error('Error while updating task', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


//#endregion

router.patch('/patchUser/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name,email,age,country,gender,isAdmin } = req.body;
        console.log(id ,name,email,age,country,gender,isAdmin )
        const updated = await updateUser(id, name,email,age,country,gender,isAdmin);
        console.log(updated)
        res.status(200).json({ message: 'Task updated successfully' ,updated});
    } catch (error) {
        console.error('Error while updating task', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//#region Carousel

router.get('/images', async (req,res)=>{
    try{
        const images= await getCarousel();
       // console.log(images);
        res.json(images)
    }
    catch(err){
        console.error('Error:',err)
    }
})
router.post('/image',async (req,res)=>{
    try{
        const {title,description,url}=req.body;
        const newImage=await createCarouselItem(title,description,url);
        res.json({message:'succesfull created image', newImage})
    }
    catch(err){
        console.error('Error:',err)
    }
})
router.patch('/updateImage/:id',async (req,res)=>{
    try{
        const {id}=req.params
        console.log(id)
        const {title,description,url}=req.body
        console.log(title,description,url)
        const newImage=await updateCarouselItem(id, title,description,url)
        res.json({message:'succesfull update of image',newImage})
    }
    catch(err){
        console.error('Error:',err)
    }
})
router.delete('/deleteImage/:id', async (req,res)=>{
    try{
        const {id}=req.params
        console.log(id)
        const delImage=await deleteCarouselItem(id) 
        res.json({message:'deleted successgully',delImage})
    }
    catch(err){
        console.error('Error:',err)
    }
})
//#endregion
module.exports = router;