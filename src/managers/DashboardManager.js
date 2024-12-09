// DashboardManager.js

class DashboardManager{
    constructor(notifyChangeCallback){
        this.notifyChange = notifyChangeCallback;
        this.editor = false;
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
}

export default DashboardManager;