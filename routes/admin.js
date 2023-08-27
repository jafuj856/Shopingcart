var express = require('express');

var router = express.Router(); 
var producthelper = require('../helpers/product-helper');
const userHelper = require('../helpers/user-helper');
 
const verfyLogin=(req,res,next)=>{

    if(req.session.adminlogedIn){
        next()
    }else{
        res.redirect('/admin')
    }
}

router.get('/',async(req,res,next)=>{
             console.log('now here')
             if(req.session.adminlogedIn){
                console.log('if prod')
                let products=await producthelper.getAllProducts()
                res.render('admin/view-prodcts',{products,status:true,admin:true})
              }
            else{
      
        console.log("here")
         res.render('admin/login',{'logerr':req.session.adminLogerr,admin:true})  
   
         req.session.adminLogerr=false
}
  })





  router.post('/login',async(req,res)=>{

    
    if(req.body.logemail=='admin@gmail.com'&&req.body.logpassword=='1234'){ 
        let products=await producthelper.getAllProducts()
      console.log('pwd log')
      req.session.admin=true
      req.session.adminlogedIn=true
      res.redirect('/admin')
    }
    else{
      req.session.adminLogerr="Invalid Username or Password"
      console.log('second now')
      res.redirect('/admin')
    }
  })  

  router.get('/logout',(req,res)=>{
    console.log('hiiiiiiiiiiiii')
    req.session.admin=null
    req.session.adminlogedIn=false
    res.redirect('/admin')
  })

router.get('/add-product',verfyLogin,(req,res)=>{ 
    res.render('admin/add-product',{status:true,admin:true})
})
router.post('/add-product',(req,res)=>{
    
    producthelper.addProduct(req.body,(id)=>{
       let image =req.files.image
       console.log(id)
       console.log(image)
       image.mv('../Shopingcart/public/product-images/'+id+'.jpg',(err,done)=>{ 
        if(!err){
        console.log(image)
            res.render('admin/add-product',{status:true,admin:true})
        }else{
            console.log(err)
        }
       })      
    })   
})

router.get('/edit-product/:id',verfyLogin,async(req,res)=>{
   
    let product =await producthelper.getProductDtails(req.params.id)
    console.log(product)
    res.render('admin/edit-product',{product,status:true,admin:true})

})
router.post('/edit-product/:id',(req,res)=>{
    
    producthelper.updatProduct(req.params.id,req.body).then(()=>{
        res.redirect('/admin')
        console.log(req.files)
        if(req.files){
let image =req.files.image
            image.mv('../Shopingcart/public/product-images/'+req.params.id+'.jpg')
        }
    })
})

router.get('/delete-product/:id',(req,res)=>{
    let proId=req.params.id
    producthelper.deleteProducts(proId).then((respons)=>{
res.redirect('/admin')
    })

})
router.get('/all-user',verfyLogin,async(req,res)=>{
    let users=await userHelper.getAllUser()
    res.render('admin/alluser',{users,admin:true,status:true})
})

router.get('/all-orders',async(req,res)=>{

    let orders=await userHelper.getAllOrders()
   res.render('admin/allorders',{orders})
})
router.get('/view-order-products/:id',async(req,res)=>{
    console.log(req.params.id+"  ============id")

    let products=await userHelper.OrderProdect(req.params.id)
    console.log(products)
    res.render('admin/orderprodetails',{admin:true,status:true,products})
})

router.get('/view-order-user/:id',async(req,res)=>{
    console.log(req.params.id)
    
   let userdetails=await userHelper.orderUser(req.params.id)
   console.log('in =====================products of admin=======')

    res.render('admin/orderuser',{admin:true,status:true,userdetails})
})
 
module.exports = router