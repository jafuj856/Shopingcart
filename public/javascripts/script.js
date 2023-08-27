function addToCart(proid,price){
   

   $.ajax({
       url:'/add-to-cart',
       data:{
            proid:proid,
            price:price
       },
       method:'post',
       success:(respons)=>{
        if(respons.status){
            let count = $('#cart-count').html()
            count = parseInt(count)+1
            $('#cart-count').html(count)
            
        }
    
       }
   })
}      