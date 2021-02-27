/**
 * Created by Emman on 01/08/2019.
 */
var mongoose = require("mongoose");
var systemmoduleSchema = new mongoose.Schema({
    dashboard :{ type:Boolean,default:false },
    jengo :{ type:Boolean,default:false },
    uwakili :{ type:Boolean,default:false },
    elimu :{ type:Boolean,default:false },
    matangazo :{ type:Boolean,default:false },
    ratiba :{ type:Boolean,default:false },
    mavuno:{ type:Boolean,default:false },
    harambee:{ type:Boolean,default:false },
    ripotijengo:{ type:Boolean,default:false },
    ripotiuwakili:{ type:Boolean,default:false },
    ripotielimu:{ type:Boolean,default:false },
    maoni:{ type:Boolean,default:false },
    maudhurio:{ type:Boolean,default:false },
    waumini:{ type:Boolean,default:false },
    watumiaji:{ type:Boolean,default:false },
    majukumu:{ type:Boolean,default:false },
    ainamatangazo:{ type:Boolean,default:false },
    ainaharambee:{ type:Boolean,default:false },
    ainawatumiaji:{ type:Boolean,default:false },
    insertby:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedby:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    role:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UsersCategory',
        unique:true
    },
    status: { type:Boolean,default:true }
}, {
    timestamps: true // Saves createdAt and updatedAt as dates. createdAt will be our timestamp.
});

var SystemModuleSchema = module.exports = mongoose.model("SystemModule", systemmoduleSchema);
module.exports = SystemModuleSchema;