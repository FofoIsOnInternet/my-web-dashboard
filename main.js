// main.js

const app = Vue.createApp({
    data(){
        return {sections:[]};
    },
    mounted(){
        this.fetchData();
    },
    methods: {
        goToLink(url) {
            window.open(url,"_blank",null);
        },
        getTextColor(bgColor) {
            // Convert hex color to RGB
            const rgb = bgColor.match(/\w\w/g).map(hex => parseInt(hex, 16));
            // Calculate relative luminance
            const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
            // Return black for bright backgrounds, white for dark
            return luminance > 0.5 ? "black" : "white";
        },
        async fetchData(){
            return await fetch("assets/data.json")
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
    },
});

app.mount("#app");