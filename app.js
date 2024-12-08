// main.js

const app = Vue.createApp({
    data(){
        return {
            sections:[],
            editor:false
        };
    },
    mounted(){
        this.fetchData();
    },
    methods: {
        /**
         * Open a new window with the given url.
         * @param {String} url 
         */
        goToLink(url) {
            window.open(url,"_blank",null);
        },

        /**
         * Calculates if the text color should rather be black or white 
         * depending on the background color.
         * @param {String} bgColor Hexadecimal color code
         * @returns "black" or "white"
         */
        getTextColor(bgColor) {
            // Convert hex color to RGB
            const rgb = bgColor.match(/\w\w/g).map(hex => parseInt(hex, 16));
            // Calculate relative luminance
            const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
            // Return black for bright backgrounds, white for dark
            return luminance > 0.5 ? "black" : "white";
        },

        /**
         * Fetch user's sections and bubbles from the assets folder
         * @returns json
         */
        async fetchData(){
            return await fetch("get-data")
            .then(response=>{
                if(response.ok){
                    return response.json();
                }else{
                    throw new Error(`Couldn't fetch links (${response.status})`);
                }
            })
            .then(data=>{
                this.sections = data.sections;
            })
            .catch(error=>{
                this.sections = {
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
        },

        async saveData(){
            const formData = new FormData();
            const data = { sections:this.sections}
            formData.append("data",JSON.stringify(data));
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
        },

        /**
         * Start the dashboard editor
         */
        startEditor(){
            // init editor
            this.editor = true;
            // init bubble editors
            this.sections.forEach(section => {
                section.bubbles.forEach(bubble => {
                    bubble.editor = false;
                });
            });
        },

        /**
         * Stop the dashboard editor
         */
        stopEditor(){
            this.editor = false;
            this.sections.forEach(section => {
                section.bubbles.forEach(bubble => {
                    bubble.editor = false;
                });
            });
        },
        
        /**
         * Open the form to edit the given bubble.
         * @param {int} sectionId id of the bubble's section
         * @param {int} bubbleId id of the bubble
         */
        startBubbleEditor(sectionId,bubbleId){
            if(!bubbleId){
                this.sections[sectionId].bubbles.push({
                    id:this.sections[sectionId].bubbles.length,
                    name:"",
                    url:"",
                    color:"#808080",
                    image:"",
                    editor:true
                })
            }else{
                this.sections[sectionId].bubbles[bubbleId].editor = true;
            }
        },
        
        /**
         * Close the editor of the given bubble.
         * @param {int} sectionId id of the bubble's section
         * @param {int} bubbleId id of the bubble
         */
        stopBubbleEditor(sectionId,bubbleId){
            this.sections[sectionId].bubbles[bubbleId].editor = false;
        },
        
        /**
         * Edit the given bubble in the system.
         * @param {int} sectionId id of the bubble's section
         * @param {int} bubbleId id of the bubble
         * @param {string} name new name
         * @param {string} url new url
         * @param {string} color new color
         * @param {string} image new image
         */
        editBubble(sectionId,bubbleId,name,url,color,image){
            this.sections[sectionId].bubbles[bubbleId] = {
                id:bubbleId,
                name:name,
                url:url,
                color:color,
                image: image && image.name.length === 0 ? this.sections[sectionId].bubbles[bubbleId].image : image.name
            }
        },

        /**
         * Delete the given bubble from the system.
         * @param {int} sectionId id of the bubble's section
         * @param {int} bubbleId id of the bubble
         */
        async deleteBubble(sectionId,bubbleId){
            // Delete image
            await this.deleteImage(this.sections[sectionId].bubbles[bubbleId].image);
            // Delete bubble
            this.sections[sectionId].bubbles.splice(bubbleId,1);
            // Save data
            await this.saveData();
        },

        /**
         * Result of submit button.
         * @param {int} sectionId id of the bubble's section
         * @param {int} bubbleId id of the bubble
         */
        async submitFormBubble(sectionId,bubbleId){
            // Finds the right form
            let form = document.getElementById(`${sectionId},${bubbleId}`);
            // Gets the values
            let name = form.querySelector("#name").value;
            let url = form.querySelector("#url").value;
            let color = form.querySelector("#color").value;
            // Get the image 
            let image = form.querySelector("#image").files[0];
            await this.saveImage(image); // Upload the image
            // Edit the bubble
            this.editBubble(sectionId,bubbleId,name,url,color,image);
            // Close the editor
            this.stopBubbleEditor(sectionId,bubbleId);
            // Save data
            this.saveData();
        },

        /**
         * Save the given image.
         * @param {File} file image to be saved
         * @returns The file name
         */
        async saveImage(file){
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
        },

        /**
         * Delete the given image.
         * @param {String} imagename Name of the image
         */
        async deleteImage(imagename){
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
        },
    },
});

app.mount("#app");