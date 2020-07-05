const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.onCreateFollower = functions.firestore
    .document("/followers/{userId}/userFollowers/{followerId}")
    .onCreate(async (snapshot, context) => {
        console.log("Follower Created", snapshot.id);
        const userId = context.params.userId;
        const followerId = context.params.followerId;

        //1) Create followed users posts ref

        const followedUserPostsRef = admin
            .firestore()
            .collection("posts")
            .doc(userId)
            .collection("userPosts");

        // 2) Create following users's timeline ref
        const timelinePostsRef = admin
            .firestore()
            .collection("timeline")
            .doc(followerId)
            .collection("timelinePost");

        // 3) Get followed users posts
        const querySnapshot = await followedUserPostsRef.get();

        //4) Add each user post to following user's timeline
        querySnapshot.forEach((doc) => {
            if (doc.exists) {
                const postId = doc.id;
                const postData = doc.data();
                timelinePostsRef.doc(postId).set(postData);
            }
        });
    });

exports.onDeleteFollower = functions.firestore
    .document("/followers/{userId}/userFollowers/{followerId}")
    .onDelete(async (snapshot, context) => {
        console.log("Follower Deleted", snapshot.id);

        const userId = context.params.userId;
        const followerId = context.params.followerId;

        const timelinePostsRef = admin
            .firestore()
            .collection("timeline")
            .doc(followerId)
            .collection("timelinePost")
            .where("ownerId", "==", userId);

        const querySnapshot = await timelinePostsRef.get();
        querySnapshot.forEach((doc) => {
            if (doc.exists) {
                doc.ref.delete();
            }
        });
    });

// WHEN A POST IS CREATED,  ADD POST TO TIMELINE OF EACH FOLLOWER (OF POST OWNER)

exports.onCreatePost = functions.firestore
    .document("/posts/{userId}/userPosts/{postId}")
    .onCreate(async (snapshot, context) => {
        const postCreated = snapshot.data();
        const userId = context.params.userId;
        const postId = context.params.postId;

        // 1) Get all the followers of the user who made the post
        const userFollowersRef = admin
            .firestore()
            .collection("followers")
            .doc(userId)
            .collection("userFollowers");

        const querySnapshot = await userFollowersRef.get();

        // 2) Add new post to each follower's timeline

        querySnapshot.forEach((doc) => {
            const followerId = doc.id;

            admin
                .firestore()
                .collection("timeline")
                .doc(followerId)
                .collection("timelinePost")
                .doc(postId)
                .set(postCreated);
        });
    });

exports.onUpdatePost = functions.firestore
    .document("/posts/{userId}/userPosts/{postId}")
    .onUpdate(async (change, context) => {
        const postUpdated = change.after.data();
        const userId = context.params.userId;
        const postId = context.params.postId;

        // 1) Get all the followers of the user who made the post
        const userFollowersRef = admin
            .firestore()
            .collection("followers")
            .doc(userId)
            .collection("userFollowers");

        const querySnapshot = await userFollowersRef.get();

        // 2) Update each post in each follower's timeline

        querySnapshot.forEach((doc) => {
            const followerId = doc.id;

            admin
                .firestore()
                .collection("timeline")
                .doc(followerId)
                .collection("timelinePost")
                .doc(postId)
                .get()
                .then((doc) => {
                    if (doc.exists) {
                        doc.ref.update(postUpdated);
                    }
                });
        });
    });

exports.onDeletePost = functions.firestore
    .document("/posts/{userId}/userPosts/{postId}")
    .onDelete(async (snapshot, context) => {
        const userId = context.params.userId;
        const postId = context.params.postId;

        // 1) Get all the followers of the user who made the post
        const userFollowersRef = admin
            .firestore()
            .collection("followers")
            .doc(userId)
            .collection("userFollowers");

        const querySnapshot = await userFollowersRef.get();

        // 2) Delete each post in each follower's timeline

        querySnapshot.forEach((doc) => {
            const followerId = doc.id;

            admin
                .firestore()
                .collection("timeline")
                .doc(followerId)
                .collection("timelinePost")
                .doc(postId)
                .get()
                .then((doc) => {
                    if (doc.exists) {
                        doc.ref.delete();
                    }
                });
        });
    });

exports.onCreateActivityFeedItem = functions.firestore
    .document("/feed/{userId}/feedItems/{activityFeedItem}")
    .onCreate(async (snapshot, context) => {
        console.log("Activity Feed Item Created", snapshot.data());

        // 1) Get user connected to the feed
        const userId = context.params.userId;

        const userRef = admin.firestore().document(`users/${userId}`);
        const doc = await userRef.get();

        // 2) Once we have user, check if they have a notification token , send notification, if they have a toekn

        const androidNotificationToken = doc.data().androidNotificationToken;
        const craetedActivityFeedItem = snapshot.data();

        if (androidNotificationToken) {
            // sends a notification
            sendNotification(androidNotificationToken, craetedActivityFeedItem);
        } else {
            console.log("NO TOKEN FOR USER, CANNOT SEND NOTIFICATION");
        }

        function sendNotification(androidNotificationToken, activityFeedItem) {
            let body;

            // 3) switch body  based on notification type
            switch (activityFeedItem.type) {
                case "commnet":
                    body = `${activityFeedItem.username} replied: ${activityFeedItem.commentData}`;
                    break;
                case "like":
                    body = `${activityFeedItem.username} liked your post`;
                    break;
                case "follow":
                    body = `${activityFeedItem.username} started following you`;
                    break;
                default:
                    break;
            }

            // 4) Create message for push notification

            const message = {
                notification: { body },
                token: androidNotificationToken,
                data: { recipient: userId },
            };

            // 5) Send message with admin.messaging()

            admin
                .messaging()
                .send(message)
                .then((response) => {
                    // Response is a message ID string
                    console.log("Successfully sent message", response);
                })
                .catch((error) => {
                    console.log("Error sending message", error);
                });
        }
    });
