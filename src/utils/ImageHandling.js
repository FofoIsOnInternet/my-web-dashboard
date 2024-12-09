// ImageHandling.js

/**
 * Save the given image.
 * @param {File} file image to be saved
 * @returns The file name
 */
export async function saveImage(file){
    if(file){
        const formData = new FormData();
        formData.append("image",file);

        return await fetch("upload-image",{
            method:"POST",
            body:formData
        })
        .then(response=>{
            if(!response.ok){
                console.error(response.error);
            }
        });
    }
}

/**
 * Delete the given image.
 * @param {String} imagename Name of the image
 */
export async function deleteImage(imagename){
    if(imagename && imagename.length > 0){
        const formData = new FormData();
        formData.append("imagename",imagename);

        await fetch("delete-image",{
            method:"POST",
            body:formData
        })
        .then(response=>{
            if(!response.ok){
                console.error(response.error);
            }
        });
    }
}
