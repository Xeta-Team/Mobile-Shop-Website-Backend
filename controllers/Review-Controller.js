import Review from "../models/Add-reviews-model.js";

export function submitReview(req, res) {
    if(req.user == null){
        return res.status(401).json({ message: "Unauthorized" });
    }

    const data = req.body;

    data.name = req.user.firstname + " " + req.user.lastname;
    data.email = req.user.email;
    data.profilePicture = req.user.profilePicture;
    data.isApproved = false; 
    const newReview = new Review(data);

    newReview.save().then(() => {
        res.status(201).json({ message: "Review submitted successfully and is pending approval." });
    }).catch((error) => {
        res.status(500).json({ message: "Error submitting review", error: error.message });
    });
}

export function getApprovedReviews(req, res) {
    const user = req.user;
    if (!user || !user.role != "admin") {
        Review.find({ isApproved: true }).then((reviews) => {
            res.status(200).json(reviews);
        }).catch((error) => {
            res.status(500).json({ message: "Error fetching reviews", error: error.message });
        }); 
    }

}

// "username": "jdoe_123",
 // "email": "john.doe@example55555.com",
  //"password": "a_secure_hashed_password_string",
  //"firstName": "John",
  //"lastName": "Doe",