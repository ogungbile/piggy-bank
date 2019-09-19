     $(document).ready(function(){
         console.log('I am here')
       $("#det").click(function(){

                  $.ajax({
                        url: "http://localhost:3000/transaction/",
                        method: 'GET',
                        data: $('this').serialize(),
                        dataType: 'json',
                    
                        success:function(data)
                        {
                            if(data){
                                console.log(data);
                                
                                var table = '<table class="table table-bordered">';
                                for(var i = 0; i < data.length; i++) {
                                    table += '<tr>';
                                    table += '<td>'+ data[i].id +'</td>';
                                    table += '<td>'+ data[i].details +'</td>';
                                    table += '<td>'+ data[i].amount +'</td>';
                                    table += '<td>'+ data[i].balance +'</td>';
                                    table += '</tr>';
                                }
                                table += '</table>';

                                $('.tag3').html(table);
                            }
                        
                       }
        
       })
     })
    })