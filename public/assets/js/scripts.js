$(document).ready(function(){
    $(document).on('change', '#file-input', function(event){
        const file = event.target.files[0];
        var reader = new FileReader();
        reader.onload = function(){
            const csvString = reader.result;
            $.post('/getDist', {
                csvString: csvString
            }).done((data)=>{
                if(data){
                    $('#download').attr('disabled', false);                                    
                }
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
