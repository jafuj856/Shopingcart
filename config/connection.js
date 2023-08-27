const mongoclient = require('mongodb').MongoClient
const state={
db:null
}
module.exports.connect=function(done){
    const url= 'mongodb+srv://jafuj856:jpcp1234@cluster0.c57ci1c.mongodb.net/'
    const dbname = 'shoping'


    mongoclient.connect(url,(err,data)=>{
        if(err) return done(err) 
        else state.db=data.db(dbname)
        console.log("mongo connection")
        return state.db = data.db(dbname)
    })
    
}
module.exports.get=function(){
    return state.db
}