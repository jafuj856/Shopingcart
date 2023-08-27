var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb')
const { response } = require('express')
var objectid = require('mongodb').ObjectId
const Razorpay = require('razorpay');



var instance = new Razorpay({
  key_id: 'rzp_test_fNPLUMucBHQqta',
  key_secret: 'PuO2ZgWGcAcsratHtGNNWPuY',
});


module.exports={
    doSiginup(userData){
    return new Promise(async(resolve,reject)=>{
         userData.password =await bcrypt.hash(userData.password,10)
         db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
            resolve(data.insertedId)
         })    
        })
   
},
doLogin:(userData)=>{
  
    
    return new Promise(async(resolve,reject)=>{
      
        let responds={}
        let user = await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.logemail})
        if(user){
           
             bcrypt.compare(userData.logpassword,user.password).then((status)=>{
                if(status){ 
                     
                      responds.user=user
                      responds.status=true
                      resolve(responds)
                }else{
                   
                    resolve({status:false})
                }
             })
        }
        else{
           
            resolve({status:false})
        }
           
    })
},

addToCart:(cart,userid)=>{
    var proid = cart.proid
    let proObj={
        item:ObjectId(cart.proid),
        price:cart.price,
        quantitty:1
    }
   return new Promise(async(resolve,reject)=>{
    let usercart = await db.get().collection(collection.CART_COLLECTION).findOne({user:objectid(userid)})
  
    console.log(usercart)
    if(usercart){
        let proExist=usercart.prodects.findIndex(prodect=>prodect.item==proid)
        console.log(proExist)
        if(proExist!=-1){
           
                  db.get().collection(collection.CART_COLLECTION)
                  .updateOne({user:objectid(userid),'prodects.item':objectid(proid)},
                  {
                    $inc:{'prodects.$.quantitty':1}
                  }
                  ).then(()=>{
                    resolve()
                  })
        }
                  
                  
          else{        
                 
        db.get().collection(collection.CART_COLLECTION).updateOne({user:objectid(userid)},
       { 
                 $push:{prodects:proObj}
       
     }
        ).then((responts)=>{
            resolve(responts)
        })
        }
    }
    else{
        let cartobj={
            user:objectid(userid),
            prodects:[proObj]
        }
        db.get().collection(collection.CART_COLLECTION).insertOne(cartobj).then((responts)=>{
            resolve(responts)
        })
    }
   })
},

getCartProducts:(userid)=>{
    return new Promise(async(resolve,reject)=>{
        let cartItems=await db.get().collection(collection.CART_COLLECTION).aggregate([
            {
                $match:{user:objectid(userid)}
            },
              {
                $unwind:'$prodects'
              },
              {
                 $project:{
                    item:'$prodects.item',
                    price:'$prodects.price',
                    quantitty:'$prodects.quantitty'
                 } 
              },
              {
              $lookup:{
                from:collection.PRODUCT_CLLECTION,
                localField:'item',
                foreignField:'_id',
                as:'prodect'

              }
            },
            {
                $project:{
                    item:1,quantitty:1,prodect:{$arrayElemAt: ["$prodect", 0]}
                }
            }
          /* {
                $lookup:{
                    from:collection.PRODUCT_CLLECTION,
                    let:{prodList:'$prodects'}, 
                    pipeline:[
                        {
                              $match:{
                                $expr:{
                                    $in:['$_id','$$prodList']
                                }
                              }
                        }
                    ],
                    as:'cartItems'  
                }
            }*/ 
        ]).toArray()
         
       
        
        resolve(cartItems)
    })
},
getCartCount:(userid)=>{
    return new Promise(async(resolve,reject)=>{
        let count = 0
        let cart = await db.get().collection(collection.CART_COLLECTION).findOne({user:objectid(userid)})
        if(cart){
            count =cart.prodects.length
        }

        resolve(count)
    })

},

changeQuantity(details){
    quantitty =parseInt(details.quantitty)
    count=parseInt(details.count)
    if(count==-1 && quantitty==1){
        db.get().collection(collection.CART_COLLECTION)
        .updateOne({_id:objectid(details.cart)},
        
        {
           $pull:{prodects:{item:objectid(details.proid)}} 
        }).then((respons)=>{
            resolve({removeitem:true})
        })
    }
   return new Promise(async(resolve,reject)=>{
   let cartcount = await db.get().collection(collection.CART_COLLECTION)
    .updateOne({_id:  objectid(details.cart),'prodects.item':objectid(details.product)},
    {
      $inc:{'prodects.$.quantitty':count}
    }
    ).then((responds)=>{
        
        resolve(responds)   
    })
    
    })
},


removeItem:(details,userid)=>{
  return new Promise((resolve,reject)=>{
    db.get().collection(collection.CART_COLLECTION)
    .updateOne({_id:objectid(details.cart)},
    {
        $pull:{prodects:{item:objectid(details.proid)}}
    }
    ).then((response)=>{
        resolve(response)
    })
    })
},


getToatalAmount:(userid)=>{
   console.log(userid)

    return new Promise(async(resolve,reject)=>{
    
     total=await db.get().collection(collection.CART_COLLECTION).aggregate([
       
            {
                $match:{user:objectid(userid)}
            },
              {
                $unwind:'$prodects'
              },
              {
                 $project:{
                    item:'$prodects.item',
                    price:'$prodects.price',
                    quantitty:'$prodects.quantitty'
                 }
              },
              
              { 
                $lookup:{
                    from:collection.PRODUCT_CLLECTION,    
                    localField:'item',
                    foreignField:'_id',  
                    as:'product'
                }
               },
               {
                $project:{
                    item:1,quantitty:1,price:1,product:{$arrayElemAt: ["$prodect", 0]}
                }
            },
               {
                $group:{
                    _id:null,
                    total:{$sum:{$multiply:['$quantitty',{$toInt:'$price'}]}}
                }
               }


             
        
         
        ]).toArray()


     console.log(total)
    
        resolve(total[0].total)
    
        
    
})


  
},
getCartProductList:(userid)=>{
   
    return new Promise(async(resolve,reject)=>{
        let cart = await db.get().collection(collection.CART_COLLECTION).findOne({user:objectid(userid)})
      
        resolve(cart)
    })
},
placeOrder:(order,products,total)=>{
    var status =null;
      return new Promise((resolve,reject)=>{
        if(order.paymentmethod!=null){
         let status =order.paymentmethod==='COD'?'placed':'pending'
         let orderObj={
                deliverydetails:{
                    mobaile:order.mbno,
                    address:order.adress,
                    pincod:order.pincode
                },
                userid:objectid(order.userid),
                paymentmethod:order.paymentmethod,
                totalPrice:total,
                products:products,
                status:status,
                date:new Date
         }
         db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
            db.get().collection(collection.CART_COLLECTION).deleteOne({user:objectid(order.userid)})
             status=true
             var oderid = response.insertedId
            resolve({status,oderid})
        
             
         })
        }else{
           
            resolve(status)
        }
      })
},
getOrderList:(userid)=>{

    return new Promise(async(resolve,reject)=>{
    var orders =await db.get().collection(collection.ORDER_COLLECTION).find({userid:objectid(userid)}).toArray()
    
         resolve(orders)
     })
},
OrderProdect:(orderid)=>{
    console.log(orderid+" in here" )
    return new Promise(async(resolve,reject)=>{
      let orderitems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
            $match:{_id:objectid(orderid)}
        },
        {
            $unwind:'$products'
          },
          {
             $project:{
                item:'$products.prodects.item',
                quantitty:'$products.prodects.quantitty'
             }
    },
      { 
        $lookup:{
            from:collection.PRODUCT_CLLECTION,    
            localField:'item',
            foreignField:'_id',  
            as:'product'
        }
       },
       {
           $unwind:'$product'
       }
     
     
       
      ]).toArray()
      console.log('orderitems')
      resolve(orderitems) 
    })

     
},
genarateRazorPay:(orderid,total)=>{
    console.log('order id total ') 
    console.log(orderid)
    console.log(total)
    return new Promise((resolve,reject)=>{
    
        var options={
                amount:total*100,
                currency:'INR',
                receipt:""+orderid
        };
        instance.orders.create(options, function(err,order){
            if(err){
                console.log(err)     
            }
            else{
            console.log("new order = ",order)
            resolve(order)
            }
        })
    })
},
verfyPayment:(details)=>{

    return new Promise((resolve,reject)=>{

        const crypto=require('crypto');
        console.log('verfy payment in helper5')
        let hmac = crypto.createHmac('sha256', 'PuO2ZgWGcAcsratHtGNNWPuY')
       
        hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]']);
      
        hmac = hmac.digest('hex')
        console.log('verfy payment in helper2')
        if(hmac==details['payment[razorpay_signature]']){

            resolve()
            console.log('verfy payment in helper3')
        }
        else{
            console.log("elelellelelelleleelel")
            reject()
        }
    })
},
changePaymentStatus:(orderid)=>{
    console.log(orderid+"==================in update")
    return new Promise((resolve,reject)=>{
db.get().collection(collection.ORDER_COLLECTION)
.updateOne({_id:objectid(orderid)},
{
$set:{
    status:'placed'
}
}
).then((respons)=>{
    console.log(respons)
    resolve()
})
    })
},
getAllUser:()=>{
    return new Promise(async(resolve,reject)=>{
      let users=await db.get().collection(collection.USER_COLLECTION).find().toArray()
      console.log(users)
           resolve(users)
    })
},
getAllOrders:()=>{
    return new Promise(async(resolve,reject)=>{
     let orders=await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
     console.log(orders)
     resolve(orders)
    })
},
orderUser:(orderid)=>{
return new Promise(async(resolve,reject)=>{
    let userData = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
      {
          $match:{_id:objectid(orderid)}
      },
      
        {
           $project:{
            deliverydetails:'$deliverydetails',
              userid:'$userid'
           }
  },
    { 
      $lookup:{
          from:collection.USER_COLLECTION,    
          localField:'userid',
          foreignField:'_id',  
          as:'user'
      }
     },
   {
    $unwind:'$user'
   }
   
     
    ]).toArray()
    console.log('orderitems')
    console.log(userData)
    resolve(userData) 
  })


}
}

