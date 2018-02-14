$(document).ready(function(){
    $(document).on('change', '#file-input', function(event){
        const file = event.target.files[0];
        var reader = new FileReader();
        reader.onload = function(){
            const csvString = reader.result;
            $.post('/getDist', {
                csvString: csvString
            }).done((data)=>{
                console.log(data);
            })
        }
        const result = reader.readAsBinaryString(file);
    });


});
