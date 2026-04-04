const mongose=require("mongoose")
async function connectToDB(){
   try{
    await mongose.connect(process.env.MONGO_URI)
console.log("Connected to Database")
   }
catch(err){
    // log the error and rethrow so callers can handle failure
    console.error(err)
    throw err
}
}
module.exports=connectToDB