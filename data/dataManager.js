class DataManager {
    constructor() {

    }

    static getDefault() {
        return new DataManager();
    }

    getAccountInfo() {
        return {
            age: '25',
            skill: 'Csharp,NodeJs,Jquery',
            sex: 'Male'
        };
    }
}

module.exports = DataManager;