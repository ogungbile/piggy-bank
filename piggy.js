     $(document).ready(function(){


      //Create Account
      $('#submit').click(function(){
        
        //Getting user inputs
        var fullname = $('#fullname').val();
        var email = $('#email').val();
        var acc_num = $('#acc_num').val();
        var acc_name = $('#acc_name').val();

        if(fullname == '' || email == '' || acc_num == '' || acc_name == ''){
          alert('All input fields are required to be filled.');
          return false;
        }
        else{

          $.ajax({
            url: "http://localhost:3000/customers",
            method:"POST",
            data: {id:null, fullname:fullname, email:email, account_num:acc_num, account_name:acc_name, balance:'0.00'},
            success:function(data) {
              //console.log('It Works');
              $('#success').html('<p class="text-center pl-5 alert alert-success">Hurray!!! You have successfully created a Piggy Account</p>');
              setTimeout( function(){ 
                  $('#success').fadeOut(); 
              }  , 2000 );
            }
          })
        }

        })


        //View All Accounts details
        $.ajax({
                url: "http://localhost:3000/customers",
                method:"GET",
                contentType: false,
                cache: false,
                processData: false,
                dataType: "json",
                success:function(data) {
                  console.log(data);
                    var table_list = '<tr><th>S/N</th><th>Fullname</th><th>Email</th><th>Account no.</th><th>Account Name</th><th>Balance</th></tr>';
                    if(data) {
                        var cust_length = data.length;
                        if(cust_length < 1) {
                            table_list = '<td colspan="6"><i>No customer account created yet.</i></td>'
                        }
                        else{
                            //getting category to view with Ajax
                            //table_list = '<table class="table table-striped overflow-auto">';
                            //table_list += '<thead><tr><th>S/N</th><th>Category. Name</th></tr></thead>';
                            table_list += '<tbody>';
                            for( var i = 0; i < data.length; i++ ) {
                                table_list += '<tr>';
                                table_list += '<td>' + (i+1) + '</td>';
                                table_list += '<td>' + data[i].fullname + '</td>';
                                table_list += '<td>' + data[i].email + '</td>';
                                table_list += '<td>' + data[i].account_num + '</td>';
                                table_list += '<td>' + data[i].account_name + '</td>';
                                table_list += '<td>#' + data[i].balance + '</td>';
                                table_list += '</tr>';
                            }
                            table_list += '</tbody>';
                            //table_list += '</table>'; 
                        } 
                    }
                    $('tbody#customers').html(table_list);
                }
            })


        //Withdraw from an account

        $.ajax({
                url: "http://localhost:3000/customers",
                method:"GET",
                contentType: false,
                cache: false,
                processData: false,
                dataType: "json",
                success:function(data) {
                  console.log(data);
                    var option_list = '<select><option value="">Select an account name</option>';
                    if(data) {
                        var cust_length = data.length;
                        if(cust_length < 1) {
                            option_list = '';
                        }
                        else{
                            for( var i = 0; i < data.length; i++ ) {
                                option_list += '<option value="'+ data[i].id +'">' + data[i].account_name + '</option>';
                            }
                        } 
                        option_list += '</select>';
                    }
                    $('select#withdraw').html(option_list);

                    //on clicking an account number
                    var selected = '';
                    $('select#withdraw').change(function(){
                      selected = $(this).children("option:selected").val();
                      if(selected != ""){
                        console.log(selected+"ww");
                        //getting the account name of the acc num selected
                        $.ajax({
                          url: 'http://localhost:3000/customers/'+selected,
                          method:"GET",
                          contentType: false,
                          cache: false,
                          dataType: "json",
                          success:function(data) {
                            console.log(selected);
                            if($('#acc_name_withdraw').val(data.account_num)){
                              $('#w_email').val(data.email);
                              $('#w_acc_num').val(data.account_num);
                              $('#w_bal').val(data.balance);
                              $('#acc_name_withdraw').attr('disabled', 'disabled');
                            }
                          }
                        })
                      }
                      else{
                        $('#acc_name_withdraw').val('');
                      }

                    })

                    $('#withdraw_btn').click(function() {
                      if(selected == ''){
                        alert('Choose an account to Withdraw from');
                        return false;
                      }
                      else if($('#amount_withdraw').val() == "" || $('#amount_withdraw').val() <= 0){
                        alert('Enter a normal value to deposit');
                        return false;
                      }

                      else if( parseFloat($('#amount_withdraw').val()) > parseFloat($('#w_bal').val()) ) {
                        alert('Insufficient fund');
                        return false;
                      }

                      /*else if($('#amount_withdraw').val() > $('#w_bal').val() ){
                        alert('Insufficient fund');
                        return false;
                      }*/



                      else {


                          var current_amt = parseFloat($('#w_bal').val());
                          var amt_withdrawn = parseFloat($('#amount_withdraw').val());
                          var new_amt = parseFloat(current_amt - amt_withdrawn);

                          var w_email = $('#w_email').val();
                          var w_acc_num = $('#w_acc_num').val();
                          var w_acc_name = $('#acc_name_withdraw').val();
                          //Updating customer's account balance
                          var withdraw = $.ajax({
                            url: "http://localhost:3000/customers/"+selected,
                            method:"PATCH",
                            data: {balance:new_amt},
                            success:function(data) {
                              console.log("account updated");
                            }
                          });

                          if(withdraw){
                            //Savind data into transaction array
                            $.ajax({
                              url: "http://localhost:3000/transactions",
                              method:"POST",
                              data: {id:null, cust_id:selected , email:w_email , account_num:w_acc_num , account_name:w_acc_name, amount:amt_withdrawn, type:"withdrawal", balance:new_amt},
                              success:function(data) {
                                console.log("transaction updated");
                              }
                            })
                          }
                          var w_success = '<div class="alert alert-success pl-5 ">';
                          w_success += '<p>We wis to inform you that a debit transaction recently occured on your account.</p>';
                          w_success += '<b><u>Transaction Details</u></b><br>';
                          w_success += '<b>Acount Number:</b> '+w_acc_num+'<br>';
                          w_success += '<b>Transaction Amount:</b> #'+amt_withdrawn+'<br>';
                          w_success += '<b>Total balance:</b> #'+new_amt+'<br>';
                          w_success += '</div>';

                          $('#w_success').html(w_success);
                          $('#acc_name_withdraw').val('');
                          $('select#withdraw').val('');
                          $('#amount_withdraw').val('');
                          setTimeout( function(){ 
                              $('#w_success').fadeOut(); 
                          }  , 10000 );

                          return false;
                          

                      }
                    })


                }
            })




        //Deposit into an account

        $.ajax({
                url: "http://localhost:3000/customers",
                method:"GET",
                contentType: false,
                cache: false,
                processData: false,
                dataType: "json",
                success:function(data) {
                  console.log(data);
                    var option_list = '<select><option value="">Select an account number</option>';
                    if(data) {
                        var cust_length = data.length;
                        if(cust_length < 1) {
                            option_list = '';
                        }
                        else{
                            for( var i = 0; i < data.length; i++ ) {
                                option_list += '<option value="'+ data[i].id +'">' + data[i].account_name + '</option>';
                            }
                        } 
                        option_list += '</select>';
                    }
                    $('select#deposit').html(option_list);

                    //on clicking an account number
                    var selected = '';
                    $('select#deposit').change(function(){
                      selected = $(this).children("option:selected").val();
                      if(selected != ""){
                        console.log(selected+"ww");
                        //getting the owner of the acc num selected
                        $.ajax({
                          url: 'http://localhost:3000/customers/'+selected,
                          method:"GET",
                          contentType: false,
                          cache: false,
                          dataType: "json",
                          success:function(data) {
                            console.log(selected);
                            if($('#acc_name_deposit').val(data.account_num)){
                              $('#d_email').val(data.email);
                              $('#d_acc_num').val(data.account_num);
                              $('#d_bal').val(data.balance);
                              $('#acc_name_deposit').attr('disabled', 'disabled');
                            }
                          }
                        })
                      }
                      else{
                        $('#acc_name_deposit').val('')
                      }

                    })

                    $('#deposit_btn').click(function() {
                      if(selected == ''){
                        alert('Choose an account to deposit in');
                        return false;
                      }

                      else if($('#amount_deposit').val() == "" || $('#amount_deposit').val() <= 0){
                        alert('Enter a normal value to deposit');
                        return false;
                      }

                      else {
                          var current_amt = parseFloat($('#d_bal').val());
                          var amt_deposit = parseFloat($('#amount_deposit').val());
                          var new_amt = parseFloat(current_amt + amt_deposit);

                          var d_email = $('#d_email').val();
                          var d_acc_num = $('#d_acc_num').val();
                          var d_acc_name = $('#acc_name_deposit').val();

                          //update account
                          var deposit = $.ajax({
                            url: "http://localhost:3000/customers/"+selected,
                            method:"PATCH",
                            data: {id:null, balance:new_amt},
                            success:function(data) {
                              console.log("account updated");
                            }
                          });
                          //save into transaction
                          if(deposit){
                            $.ajax({
                              url: "http://localhost:3000/transactions",
                              method:"POST",
                              data: {id:null, cust_id:selected, email:d_email, account_num:d_acc_num, account_name:d_acc_name, amount:amt_deposit, type:'deposit', balance:new_amt},
                              success:function(data) {
                                console.log('Amount deposited');
                              }

                            })
                          }

                          var d_success = '<div class="alert alert-success pl-5 ">';
                          d_success += '<p>We wis to inform you that a credit transaction recently occured on your account.</p>';
                          d_success += '<b><u>Transaction Details</u></b><br>';
                          d_success += '<b>Acount Number:</b> '+d_acc_num+'<br>';
                          d_success += '<b>Transaction Amount:</b> #'+amt_deposit+'<br>';
                          d_success += '<b>Total balance:</b> #'+new_amt+'<br>';
                          d_success += '</div>';

                          $('#d_success').html(d_success);
                          $('#acc_name_deposit').val('');
                          $('select#deposit').val('');
                          $('#amount_deposit').val('');
                          setTimeout( function(){ 
                              $('#d_success').fadeOut(); 
                          }  , 10000 );
                          return false;

                      }
                    })


                }
            })



        //View Account Statement

        $.ajax({
                url: "http://localhost:3000/customers",
                method:"GET",
                contentType: false,
                cache: false,
                processData: false,
                dataType: "json",
                success:function(data) {
                  console.log(data);
                    var option_list = '<select><option value="">Select an account number</option>';
                    if(data) {
                        var cust_length = data.length;
                        if(cust_length < 1) {
                            option_list = '';
                        }
                        else{
                            for( var i = 0; i < data.length; i++ ) {
                                option_list += '<option value="'+ data[i].id +'">' + data[i].account_name + '</option>';
                            }
                        } 
                        option_list += '</select>';
                    }
                    $('select#statement').html(option_list);

                    //on clicking an account number
                    var selected = '';
                    $('select#statement').change(function(){
                      selected = $(this).children("option:selected").val();
                      if(selected != ""){
                        console.log(selected+"ww");
                        //getting the owner of the acc num selected
                        $.ajax({
                          url: 'http://localhost:3000/customers/'+selected,
                          method:"GET",
                          contentType: false,
                          cache: false,
                          dataType: "json",
                          success:function(data) {
                            console.log(selected);
                            if($('#acc_name_statement').val(data.account_num)){
                              $('#acc_name_statement').attr('disabled', 'disabled');
                            }
                          }
                        })
                      }
                      else{
                        $('#acc_name_statement').val('')
                      }

                    })

                    $('#statement_btn').click(function() {
                      if(selected == '')
                        alert('Choose an account to view its transactions');

                      else {

                          $.ajax({
                            url: "http://localhost:3000/transactions?cust_id="+selected,
                            method:"GET",
                            contentType: false,
                            cache: false,
                            processData: false,
                            dataType: "json",
                            success:function(data) {
                              var stmt = '<table class="table table-striped mt-3">';
                              stmt += '<thead><tr>';
                              stmt += '<th>S/N</th><th>Account Name</th><th>Account No.</th><th>Type</th><th>Amount #</th><th>Balance #</th>';
                              stmt += '</tr></thead>';
                              stmt += '<tbody><tr>';
                              for(var i = 0; i < data.length; i++){
                                stmt += '<td>'+ (i+1) +'</td>';
                                stmt += '<td>'+ data[i].account_name +'</td>';
                                stmt += '<td>'+ data[i].account_num + '</td>';
                                stmt += '<td>'+ data[i].type + '</td>';
                                stmt += '<td>'+ data[i].amount + '</td>';
                                stmt += '<td>' + data[i].balance + '</td>';
                                stmt += '</tr>';
                              }
                              stmt += '</tbody>';
                              stmt += '</table>';

                              $('#stmt').html(stmt);
                            }
                          })
                          return false;
                      }
                    })


                }
            })
       

    })