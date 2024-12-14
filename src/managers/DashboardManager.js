// DashboardManager.js

class DashboardManager{
    constructor(notifyChangeCallback){
        this.notifyChange = notifyChangeCallback;
        this.editor = false;
        this.bgPath = "";
    }

    /**
    * Start the dashboard editor
    */
    startEditor(){
        // init editor
        this.editor = true;
        // notify of change
        this.notifyChange();
    }

    /**
     * Stop the dashboard editor
     */
    stopEditor(){
        // stop editor
        this.editor = false;
        // notify of change
        this.notifyChange();
    }

    /**
     * Ask the user to select an image to change the dashboard background image.
     */
    changeBackground(){
        // Get the image input 
        const inputFile = document.getElementById("input-bg-image");
        // Add onsubmit function
        inputFile.onchange = async()=>{
            let image = inputFile.files[0];
            // Upload
            await this.setBackground(image);
            // Reload path
            await this.fetchBackgroundPath();
            // notify of change
            this.notifyChange();
        }
        // Open dialog
        inputFile.click();
    }

    /**
     * Remove the user's custom bacground.
     */
    async deleteBackground(){
        // Create form data without any image
        const formData = new FormData();
        // Send change
        await fetch("set-bg",{
            method:"POST",
            body:formData
        });
        // Reload path
        await this.fetchBackgroundPath();
        // notify of change
        this.notifyChange();
    }

    /**
     * Upload the given image as background for the dashboard.
     * @param {File} image 
     */
    async setBackground(image){
        if(image){
            // Create form data
            const formData = new FormData();
            formData.append("image",image);
            // Send
            await fetch("set-bg",{
                method:"POST",
                body:formData
            });
        }
    }

    /**
     * Fetch the path to the background image.
     */
    async fetchBackgroundPath(){
        const cacheBuster = `?t=${new Date().getTime()}`;
        const path = await fetch('/get-bg')
            .then(response=>{
                if(response.ok){
                    return response.json();
                }
                throw new Error(`Couldn't load background image.(${response.status})`)
            })
            .then(json=>json.path);
        this.bgPath = path + cacheBuster;
    }

}

export default DashboardManager;