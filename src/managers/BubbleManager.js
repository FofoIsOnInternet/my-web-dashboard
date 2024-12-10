// BubbleManager.js

// Imports
import { deleteImage } from "../utils/ImageHandling.js";

class BubbleManager{
    constructor(notifyChangeCallback){
        this.sections = [];
        this.notifyChange = notifyChangeCallback;
    }

    getSections=()=>this.sections;

    /**
     * Fetch user's sections and bubbles
     */
    async fetchData(){
        // fetch
        this.sections = await fetch("get-data")
        .then(response=>{
            if(response.ok){
                return response.json();
            }else{
                throw new Error(`Couldn't fetch links (${response.status})`);
            }
        })
        .then(data=>{
            return data.sections;
        })
        .catch(error=>{
            return {
                sections: [
                    {
                        id: 0,
                        title: error.message,
                        bubbles:[
                            { name:"Reload page", url:window.location.href }
                        ]
                    }
                ]
            };
        });
        // Init bubble editors
        this.sections.forEach(section => {
            section.bubbles.forEach(bubble => {
                bubble.editor = false;
            });
        });
        // Notify of change
        this.notifyChange();
    }

    /**
     * Save User's sections and bubbles
     */
    async saveData(){
        // Create form data
        const formData = new FormData();
        const data = {sections:this.sections}
        // Add data
        formData.append("data",JSON.stringify(data,(key, value) => {
            // Remove useless editor attribute
            if (key === "editor"){
                return undefined;
            }
            return value;
        }));
        // fetch
        await fetch("set-data",{
            method:"POST",
            body:formData
        })
        .then(response=>{
            if(response.ok){
                console.log(response.message);
            }else{
                console.error(response.message);
            }
        });
    }

    /**
     * Open the form to edit the given bubble.
     * @param {int} sectionId id of the bubble's section
     * @param {int} bubbleId id of the bubble
     */
    startBubbleEditor(sectionId,bubbleId){
        // If no bubbleId is give --> create a new one
        if(!bubbleId && bubbleId != 0){
            this.sections[sectionId].bubbles.push({
                id:this.sections[sectionId].bubbles.length,
                name:"",
                url:"",
                color:"#808080",
                image:"",
                editor:true
            })
        }else{
            // Start bubble editor
            this.sections[sectionId].bubbles[bubbleId].editor = true;
        }
        // Notify of change
        this.notifyChange();
    }
    
    /**
     * Close the editor of the given bubble.
     * @param {int} sectionId id of the bubble's section
     * @param {int} bubbleId id of the bubble
     */
    stopBubbleEditor(sectionId,bubbleId){
        // Stop bubble editor
        this.sections[sectionId].bubbles[bubbleId].editor = false;
        // Notify of change
        this.notifyChange();
    }
    
    /**
     * Edit the given bubble in the system.
     * @param {int} sectionId id of the bubble's section
     * @param {int} bubbleId id of the bubble
     * @param {string} name new name
     * @param {string} url new url
     * @param {string} color new color
     * @param {File} image new image
     */
    editBubble(sectionId,bubbleId,name,url,color,image){
        // If no new image is given keep the current image
        let imagename = this.sections[sectionId].bubbles[bubbleId].image;
        if(image && image.name.length != 0){
            imagename = image.name;
        }
        // Replace the bubble
        this.sections[sectionId].bubbles[bubbleId] = {
            id:bubbleId,
            name:name,
            url:url,
            color:color,
            image: imagename
        }
        // Notify of change
        this.notifyChange();
    }

    /**
     * Delete the given bubble from the system.
     * @param {int} sectionId id of the bubble's section
     * @param {int} bubbleId id of the bubble
     */
    async deleteBubble(sectionId,bubbleId){
        // Delete image
        await deleteImage(this.sections[sectionId].bubbles[bubbleId].image);
        // Delete bubble
        this.sections[sectionId].bubbles.splice(bubbleId,1);
        // Save data
        await this.saveData();
        this.notifyChange();
    }

    /**
     * Keeps the same order but remove the space between bubbles.
     * Ex: 0, 1, 3, 4 ---> 0, 1, 2, 3
     */
    reorderBubbles(){}
}

export default BubbleManager;