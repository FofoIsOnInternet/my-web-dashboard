// main.js

// Imports
import BubbleManager from "./src/managers/BubbleManager.js";
import DashboardManager from "./src/managers/DashboardManager.js";
import { saveImage } from "./src/utils/ImageHandling.js";
import { goToLink, getTextColor } from "./src/utils/Utility.js";

// App
const app = Vue.createApp({
    data(){
        return {
            sections:[],
            editor:false
        };
    },
    mounted(){
        this.bubbleManager = new BubbleManager(this.updateView);
        this.dashboardManager = new DashboardManager(this.updateView);
        this.bubbleManager.fetchData();
    },
    methods: {

        updateView() {
            this.sections = Vue.ref(this.bubbleManager.sections);
            this.editor = Vue.ref(this.dashboardManager.editor);
        },


        // UTILITY

        goToLink,

        getTextColor,


        // DASHBOARD
        
        startEditor(){
            this.dashboardManager.startEditor();
        },

        
        stopEditor(){
            this.dashboardManager.stopEditor();
        },
        
        
        // SECTIONS

        async renameSection(sectionId){
            await this.bubbleManager.renameSection(sectionId);
        },

        async deleteSection(sectionId){
            await this.bubbleManager.deleteSection(sectionId);
        },

        async moveSection(sectionId){
            await this.bubbleManager.moveSection(sectionId);
        },

        async newSectionButton(){
            let title = prompt("Name:");
            if(title){
                await this.bubbleManager.addSection(title);
            }
        },


        // BUBBLES

        startBubbleEditor(sectionId,bubbleId){
            this.bubbleManager.startBubbleEditor(sectionId,bubbleId);
        },

        async deleteBubble(sectionId,bubbleId){
            await this.bubbleManager.deleteBubble(sectionId,bubbleId);
        },

        async moveBubble(sectionId,bubbleId){
            await this.bubbleManager.moveBubble(sectionId,bubbleId);
        },


        // BUBBLE FORM

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
            await saveImage(image); // Upload the image
            // Edit the bubble
            this.bubbleManager.editBubble(sectionId,bubbleId,name,url,color,image);
            // Close the editor
            this.bubbleManager.stopBubbleEditor(sectionId,bubbleId);
            // Save data
            this.bubbleManager.saveData();
        },

    },
});

app.mount("#app");