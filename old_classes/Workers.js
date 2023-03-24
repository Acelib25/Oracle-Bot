export class Workers {
    constructor(){
        this.workers = [];
    }
    //Worker methods
    get(){
  
    }
    addWorker(){
  
    }
    deleteWorker(){
  
    }
    deployWorker(){
  
    }
    retrieveWorker(){
  
    }
    arrestWorker(){
  
    }
    freeWorker(){
  
    }
    updateWorker(){
  
    }
  
    get deployed(){
        return this.workers.filter(worker => worker.state == "deployed" )
    }
    get undeployed(){
        return this.workers.filter(worker => worker.state == "deployed" )
    }
    get arrested(){
        return this.workers.filter(worker => worker.state == "deployed" )
    }
}
