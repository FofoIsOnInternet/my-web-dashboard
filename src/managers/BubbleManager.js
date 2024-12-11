// BubbleManager.js

// Imports
import { deleteImage } from "../utils/ImageHandling.js";

class BubbleManager{
    constructor(notifyChangeCallback){
        this.sections = [];
        this.notifyChange = notifyChangeCallback;
    }


    // DATA


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
            if(!response.ok){
                console.error(response.message);
            }
        });
    }


    // BUBBLE EDITOR


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
    

    // BUBBLE


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
        // In case a bubble was removed in the middle 
        this.reorderBubbles();
        // Save data
        await this.saveData();
        // Notify of change
        this.notifyChange();
    }

    /**
     * Ask the user and moves the given bubble to a new sections and position.
     * @param {int} sectionId id of the bubble's section
     * @param {int} bubbleId id of the bubble
     */
    async moveBubble(sectionId,bubbleId){
        // Ask: Move to section
        let newSectionId = parseInt(prompt("Move to section: ",sectionId));
        // Ask: Move at bubble
        let newBubbleId = parseInt(prompt("Move at bubble: ",bubbleId));
        // If inputs are correct
        if(!isNaN(newSectionId) && !isNaN(newBubbleId) &&
            newSectionId >= 0 && newSectionId <= this.sections.length &&
            newBubbleId >= 0 && newBubbleId <= this.sections[newSectionId].bubbles.length){
            // Move
            let bubble = this.sections[sectionId].bubbles.splice(bubbleId,1)[0];
            this.sections[newSectionId].bubbles.splice(newBubbleId,0,bubble);
            // Reorder other bubbles
            this.reorderBubbles();
            // Save data
            await this.saveData();
            // Notify of change
            this.notifyChange();
        }
    }

    /**
     * Keeps the same order but remove the space between bubbles.
     * Ex: 0, 1, 3, 4 ---> 0, 1, 2, 3
     */
    reorderBubbles(){
        this.sections.forEach((section=>{
            for(let i=0;i<section.bubbles.length;i++){
                section.bubbles[i].id = i;
            }
        }));
    }


    // SECTIONS 

    /**
     * Edit the given section.
     * @param {int} sectionId 
     * @param {string} title 
     */
    editSection(sectionId, title){
        this.sections[sectionId].title = title;
    }

    /**
     * Ask the user and change the title of the given section.
     * @param {int} sectionId 
     */
    async renameSection(sectionId){
        // Ask for new title
        let title = prompt(`Enter new title for section n°${sectionId}:`,this.sections[sectionId].title);
        // if not canceled : edit, save, notify
        if(title){
            this.editSection(sectionId,title);
            await this.saveData();
            this.notifyChange();
        }
    }

    /**
     * Delete the given section.
     * @param {int} sectionId 
     */
    async deleteSection(sectionId){
        if(confirm(`Are you sure you want to delete section n°${sectionId}?`)){
            // Delete all images
            this.sections[sectionId].bubbles.forEach(bubble =>{
                deleteImage(bubble.image);
            });
            // Remove
            this.sections.splice(sectionId,1);
            // Reorder other sections
            this.reorderSections();
            // save
            await this.saveData();
            // Notify of change
            this.notifyChange();
        }
    }

    /**
     * Ask the user and move the given section to a new position.
     * @param {int} sectionId 
     */
    async moveSection(sectionId){
        // Ask: Move at section
        let newSectionId = parseInt(prompt("Move at section: ",sectionId));
        // If inputs are correct
        if(!isNaN(newSectionId) &&
            newSectionId >= 0 && newSectionId <= this.sections.length){
            // Move
            let section = this.sections.splice(sectionId,1)[0];
            this.sections.splice(newSectionId,0,section);
            // Reorder other sections
            this.reorderSections();
            // Save data
            await this.saveData();
            // Notify of change
            this.notifyChange();
        } 
    }

    /**
     * Keeps the same order but remove the space between sections.
     * Ex: 0, 1, 3, 4 ---> 0, 1, 2, 3
     */
    reorderSections(){
        for(let i=0;i<this.sections.length;i++){
            this.sections[i].id = i;
        }
    }
}

export default BubbleManager;