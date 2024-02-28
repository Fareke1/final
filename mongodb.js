const { MongoClient } = require('mongodb')
const { ObjectId } = require('mongodb');

const uri = "mongodb+srv://zhanikplanet1:narutoplanet@cluster0.zyfk98y.mongodb.net/?retryWrites=true&w=majority"

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function connectMongodb() {
    try {
        await client.connect()
        console.log("Connected to Mongodb")
        return client
    }
    catch (error) {
        console.error("Failed to connect to Mongodb", error)
        throw error
    }
}



async function createTask(title, content, difficulty, isCompleted, userId) {
    //console.log(`${title},${content},${difficulty},${isCompleted},${userId}`)
    try {
        if (!title || !content || !difficulty)
            throw new Error('Missing required parameters');

        const database = client.db('final');
        const collection = database.collection('TaskList');

     
        const userIdObj = new ObjectId(userId);

        const result = await collection.insertOne({ title, content, difficulty, isCompleted, userId: userIdObj });
        if (result.acknowledged)
            console.log('You successfully created the task');
        else
            throw Error('No documents inserted');
        return result
    }
    catch (error) {
        console.error('Error creating task:', error);
        throw error;
    }
}


async function createUser(name, email, password, age, country, gender,isAdmin) {
    try {
        if (!name || !email || !password || !age || !country || !gender)
            throw new Error('Missing required parametres')
        const database = client.db('final')
        const collection = database.collection('users')
        const result = await collection.insertOne({ name, email, password, age, country, gender ,isAdmin })

        if (result.acknowledged)
            console.log('You succesfully create user')
        else
            throw Error('No domunets inserted')
            return getUserInfoFromDatabase(email)
    }
    catch (error) {
        console.error('Error while creating new user', error)
    }
}

async function getTask(userId) {
   // console.log(userId)
    const userIdObject = new ObjectId(userId);
    try {
        const database = client.db('final');
        const collection = database.collection('TaskList');
        const result = await collection.find({ userId: userIdObject }).toArray();
        //console.log(result)
        return result;
    } catch (error) {
        console.error('Error when retrieving tasks from collection', error);
        throw error;
    }
}

async function getCompletedTask(userId) {
   // console.log(userId)
    const userIdObject = new ObjectId(userId);
    try {
        const database = client.db('final');
        const collection = database.collection('TaskList');
        const result = await collection.find({ userId: userIdObject, isCompleted: true }).toArray(); 
        //console.log(result)
        return result;
    } catch (error) {
        console.error('Error when retrieving completed tasks from collection', error);
        throw error;
    }
}


async function getLoginUser(loginEmail) {
    try {
        const database = client.db('final');
        const collection = database.collection('users');
        const user = await collection.findOne({ email: loginEmail });
        return user;
    }
    catch (error) {
        console.error('Error while getting users for login from db', error)
        throw error
    }
}
async function getUserInfoFromDatabase(loginEmail) {
    //console.log(loginEmail);
    try {
        const database = client.db('final');
        const collection = database.collection('users');
        const user = await collection.findOne({ email: loginEmail });
        //console.log(user);
        return user;
    } catch (error) {
        console.error('Error while getting users for login from db', error);
        throw error;
    }
}

async function getAllUsersDB(){
    try{
        const database=client.db('final')
        const collection= database.collection('users')
        const result = await collection.find().toArray()
        return result
    }
    catch(error){
        console.error('error in db', error)
    }
}

async function deleteTasks(id) {
    //console.log(`${id}`)
    try {
        if (!id)
            throw new Error('Missing required parameter')
        const database = client.db('final')
        const collection = database.collection('TaskList')
        const result = await collection.deleteOne({ _id: new ObjectId(id) })
        return result.deletedCount > 0
    }
    catch (error) {
        console.error('Error while deleting tasks in db:', error)
        throw error;
    }
}


async function updateTask(id, isCompleted) {
    try {
        const database = client.db('final');
        const collection = database.collection('TaskList');
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { isCompleted: true } }
        );
        return result.modifiedCount > 0;
    } catch (error) {
        console.error('Error when updating task in db', error);
        throw error;
    }
}

async function checkEmailUnique(email) {
    try {
        const database = client.db('final');
        const collection = database.collection('users');
        const existingUser = await collection.findOne({ email });
        return !existingUser; 
    } catch (error) {
        console.error('Error while checking email uniqueness:', error);
        throw error;
    }
}

async function getCarousel(){
    try{
        const database = client.db('final')
        const collection=database.collection('carousel')
        const allImages= await collection.find().toArray()
        return allImages
    }
    catch(err)
    {
        console.error('Error:',err)
        throw err;
    }
} 

async function createCarouselItem(title,description,url){
    try{
        const database=client.db('final')
        const collection=database.collection('carousel')
        const createItem= await collection.insertOne({title,description,url})
        if (createItem.acknowledged)
        console.log('You successfully created the task');
        else
        throw Error('No documents inserted');
        return createItem
    }
    catch(err)
    {
        console.error('Error: ',err)
        throw err
    }
}

async function updateCarouselItem(id,title,description,url){
    try{
        console.log(id)
        const database=client.db('final')
        const collection=database.collection('carousel')
        const Id= new ObjectId(id)
        const updateItem=await collection.updateOne({_id:Id},{$set:{title:title,description:description,url:url}})
        return updateItem.modifiedCount > 0;
    }
    catch(err)
    {
        console.error('Error: ',err)
        throw err
    }
}

async function deleteCarouselItem(id){
    try{
        const database=client.db('final')
        const collection=database.collection('carousel')
        const Id=new ObjectId(id)
        const deleteItem=await collection.deleteOne({_id: Id})
        return deleteItem.deletedCount > 0
    }
    catch(Err){
        console.log('Error: ',Err)
        throw Err
    }
}

async function updateUser(id,name,email,age,country,gender,isAdmin){
    try{
        console.log(id,name,email,age,country,gender,isAdmin)
        const database=client.db('final')
        const collection=database.collection('users')
        const Id= new ObjectId(id)
        const updateItem=await collection.updateOne({_id:Id},{$set:{name:name,email:email,age:age,country:country,gender:gender,isAdmin:isAdmin}})
        return updateItem.modifiedCount > 0;
    }
    catch(err){
        console.error('Error: ',err)
    }
}

module.exports = { connectMongodb,  getLoginUser,createUser,checkEmailUnique ,getCompletedTask,getTask,updateTask,createTask,deleteTasks,getAllUsersDB,getUserInfoFromDatabase,getCarousel,createCarouselItem,updateCarouselItem,deleteCarouselItem,updateUser}