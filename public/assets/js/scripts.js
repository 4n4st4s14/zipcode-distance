$(document).ready(function(){
    $(document).on('change', '#file-input', function(event){
        const file = event.target.files[0];
        var reader = new FileReader();
        reader.onload = function(){
            const csvString = reader.result;
            $('#spinner').html(`<div class="preloader-wrapper big active">
                <div class="spinner-layer spinner-green">
                    <div class="circle-clipper left">
                    <div class="circle"></div>
                    </div><div class="gap-patch">
                    <div class="circle"></div>
                    </div><div class="circle-clipper right">
                    <div class="circle"></div>
                    </div>
                    </div>
                </div>`);
            $.post('/getDist', {
                csvString: csvString
            }).done((data)=>{
                
                $('#download').attr('disabled', false);    
                $('#spinner').html('');                                
                console.log(data);
                $(document).on('click', '#download', function(){
                    download(data, 'data.csv');
                });
                data.forEach(function(data) {
                    console.log(data);

                    let newDiv = $(`<tr>
                          <td>${data.name}</td>
                          <td>${data.zipcode}</td>
                          <td>${data.distance}</td>
                                  </tr>`);

                    $('#data').append(newDiv);

                    });



            })
        }
        const result = reader.readAsBinaryString(file);
    });


});
