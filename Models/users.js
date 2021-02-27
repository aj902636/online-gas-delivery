/**
 * Created by Ajay kumar Tripathi on 26/09/2020.
 */
var mongoose = require("mongoose");
var userSchema = new mongoose.Schema({
    username: {type: String, required:true },
    email:{ type: String,uloginnique: true },
    phoneNumber : {type: String,unique: true },
    password: { type: String, required: true },
    profileImage:{ type: String,default:""},
    document:{type:String, default:""},
    role:{type:Number,required:true},        //1=>admin , 2=>'vender' , 3=> 'user' , 4=> 'delivery boy', 5=>'sub-admin'
    otp:{type:Number},
    companyDetails : {type:String, default:""},
    isapprove:{type:Number, default:0},
    insertby:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default:null
    },
    status:{ type:Boolean,default:true }
}, {
    timestamps: true // Saves createdAt and updatedAt as dates. createdAt will be our timestamp.
});

userSchema.methods.name = function() {
    return this.displayName || this.username;
};

var bcrypt = require("bcrypt-nodejs");
var SALT_FACTOR = 10;

var noop = function() {};
userSchema.pre("save", function(done) {
    var user = this;
    if (!user.isModified("password")) {
        return done();
    }
    bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
        if (err) { return done(err); }
        bcrypt.hash(user.password, salt, noop, function(err, hashedPassword) {
            if (err) { return done(err); }
            user.password = hashedPassword;
            done();
        });
    });
});

userSchema.methods.checkPassword = function(guess, done) {
    bcrypt.compare(guess, this.password, function(err, isMatch) {
        done(err, isMatch);
    });
};

var User = module.exports = mongoose.model("User", userSchema);

module.exports.getUserById = function(id,callback){
    User.findById(id,callback);
};
module.exports.getUserByUsername = function(username,callback){
    if(isNaN(username)){
        var query = {email:username};
    }else{
        var query = {phoneNumber:username};
    }
   // console.log(query); 
   // var query = {username:username};
    User.findOne(query,callback);
};
module.exports.comparePassword = function(candidatePassword,hash,callback){
    bcrypt.compare(candidatePassword,hash,function(err , isMatch){
        callback(null,isMatch);
    });
};

module.exports = User;