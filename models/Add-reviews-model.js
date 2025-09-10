import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
    {
        email : {
            type: String,
            required: true,
            unique: true
        },

        name :{
            type: String,
            required: true
        },

        rating :{
            type: Number,
            required: true
        },

        profilePicture :{
            type: String,
            required: true,
            default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
        },
        message :{
            type: String,
            required: true
        }  ,

        date: {
            type: Date,
            default: Date.now   
        },

        isApproved: {
            type: Boolean,
            default: false
        }
    }
);              

const Review = mongoose.model('Review', reviewSchema);

export default Review;