var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient
var producthelper=require('../helpers/product-helper')
var userhelper = require('../helpers/user-helper')

const verfiyLogin=(req,res,next)=>{
  console.log(req.session.userlogedIn)
  if(req.session.userlogedIn){
  
    next()
  }
  else{
    res.redirect('/login')
  }
} 

/* GET home page. */
router.get('/',async function(req, res, next) {
  let user = req.session.user
  let cartcount=null;
  if(req.session.userlogedIn){
  cartcount = await userhelper.getCartCount(req.session.user._id)
  }
  producthelper.getAllProducts().then((prodects)=>{
    
    res.render('user/view-prodcts', { prodects,user,cartcount}); 
    })
    

  })

  
 


router.get('/siginup',(req,res)=>{
  if(req.session.userlogedIn){
    res.redirect('/')
  }
  else{
  res.render('user/siginup')
  }
})
router.post('/siginup',(req,res)=>{

  userhelper.doSiginup(req.body).then((responds)=>{
    req.session.user=req.body
    req.session.userlogedIn=true
    res.redirect('/')
    
     
 
  })
  
  
})

router.get('/login',(req,res)=>{
  
  if(req.session.userlogedIn){
    
    
    res.redirect('/')
   }
   else{
  
  res.render('user/login',{'logerr':req.session.userLogerr})

  req.session.userLogerr=false
   }

})


router.post('/login',(req,res)=>{

  userhelper.doLogin(req.body).then((responds)=>{
    if(responds.status){ 
      
      req.session.user=responds.user
      req.session.userlogedIn=true
      console.log(req.session.user)
      res.redirect('/')
    }
    else{
      req.session.userLogerr="Invalid Username or Password"
      res.redirect('/login')
    }
  })  
})
router.get('/logout',(req,res)=>{
  req.session.user=null
  res.redirect('/')
})
 
router.get('/cart',verfiyLogin,async(req,res)=>{ 

  
  let products =await userhelper.getCartProducts(req.session.user._id)
  let total = 0;
  if(products.length>0){
    console.log('total in cart')
    
 total = await userhelper.getToatalAmount(req.session.user._id)
 console.log(total)
 res.render('user/cart',{products,user:req.session.user,total})  
  }
  console.log("product quantitty")
 
 
})

/*  cart module   */
 
router.post('/add-to-cart',verfiyLogin,(req,res)=>{

  userhelper.addToCart(req.body,req.session.user._id).then(()=>{
   
    res.json({status:true})
  }) 
})

router.post('/change-product-quantity',(req,res,next)=>{

  userhelper.changeQuantity(req.body).then((responts)=>{
   
    res.json(responts)
   
   // res.json(count)
  })
})


  router.post('/remove-item-cart',verfiyLogin,(req,res,next)=>{
    console.log("in index")

    userhelper.removeItem(req.body,req.session.user._id).then((responts)=>{
      
      res.json(responts)
    })
    
  })

  router.get('/place-order',verfiyLogin,async(req,res,next)=>{
    let total = await userhelper.getToatalAmount(req.session.user._id)
   
   res.render('user/place-order',{user:req.session.user,total})
  })

  router.post('/place-order',verfiyLogin,async(req,res)=>{
    let products = await userhelper.getCartProductList(req.body.userid)
    let total = await userhelper.getToatalAmount(req.body.userid)

   userhelper.placeOrder(req.body,products,total).then((response)=>{
    console.log('in index =========================')
  
    console.log(response.oderid)
       if(req.body['paymentmethod']=='COD'){
        response.status1='done1'
        res.json(response)
       }
       else{
           userhelper.genarateRazorPay(response.oderid,total).then((response)=>{
            console.log('genarat')
            response.status1='done'
            console.log(response)  
            
             res.json(response)
           })
       }
          
   })
    
  }) 
  router.get('/order-success',verfiyLogin,(req,res)=>{
  
    res.render('user/order-success',{user:req.session.user})
  }) 
  router.get('/orders',verfiyLogin,async(req,res)=>{
   
    let orders =await userhelper.getOrderList(req.session.user._id)
    
    
    
   
    res.render('user/order',{orders,user:req.session.user}) 
  })


  router.get('/view-order-products/:id',verfiyLogin,async(req,res)=>{
    
   
    let orderprodect =await userhelper.OrderProdect(req.params.id)
    console.log("order product in========================================================= pro list")
   
   let quantitty1=orderprodect[0].quantitty
    
    res.render('user/orderprolist',{orderprodect,quantitty1,user:req.session.user})
  })
  router.post('/verfy-payment',(req,res)=>{
    console.log("verfypayment")
    console.log(req.body)
    userhelper.verfyPayment(req.body).then(()=>{
      console.log('HIIIIIIIIIIIIIIIIIIIIIIIIIIII')
      console.log(req.body['order[receipt]'])
        userhelper.changePaymentStatus(req.body['order[receipt]']).then(()=>{
          console.log('payment success=====================++++++++++++++++')
          res.json({status:true})
        })
    }).catch((err)=>{
      console.log(err)
      res.json({status:false,errmsg:""})
    })

  })
  
module.exports = router;





