import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import '../pages/search.dart';
import '../widgets/post.dart';
import '../pages/home.dart';
import '../models/user.dart';
import '../widgets/header.dart';
import '../widgets/progress.dart';

final usersRef = Firestore.instance.collection('users');

class Timeline extends StatefulWidget {
  final User currentUser;

  const Timeline({this.currentUser});

  @override
  _TimelineState createState() => _TimelineState();
}

class _TimelineState extends State<Timeline> {
  List<dynamic> users = [];
  List<Post> posts;
  List<String> followingList = [];

  @override
  void initState() {
    // getUsersById();
    // createUser();
    // updateUser();
    // deleteUser();
    getTimeline();
    getFollowing();
    super.initState();
  }

  getTimeline() async {
    QuerySnapshot snapshot = await timelineRef
        .document(widget.currentUser.id)
        .collection('timelinePosts')
        .orderBy('timestamp', descending: true)
        .getDocuments();

    List<Post> posts =
        snapshot.documents.map((doc) => Post.fromDocument(doc)).toList();

    setState(() {
      this.posts = posts;
    });
  }

  // createUser() async {
  //   usersRef.document('asodnfasd0iasd').setData({
  //     'username': 'Jeff',
  //     'postsCount': 0,
  //     'isAdmin': false,
  //   });
  // }

  // updateUser() async {
  //   final doc = await usersRef.document('EqvoFze1J6rGLMEncErh').get();
  //   if (doc.exists) {
  //     doc.reference.updateData({
  //       'username': 'John',
  //       'postsCount': 0,
  //       'isAdmin': false,
  //     });
  //   }
  // }

  // deleteUser() async {
  //   final DocumentSnapshot doc =
  //       await usersRef.document('EqvoFze1J6rGLMEncErh').get();
  //   if (doc.exists) {
  //     doc.reference.delete();
  //   }
  // }

  // getUsersById() async {
  //   final String id = 'xgB8ZIBiIinnxNKZKMWj';
  //   final DocumentSnapshot doc = await usersRef.document(id).get();
  //   print(doc.data);
  //   print(doc.documentID);
  //   print(doc.exists);
  // }

  // @override
  // Widget build(context) {
  //   return Scaffold(
  //     appBar: header(context, isAppTitle: true),
  //     body: StreamBuilder<QuerySnapshot>(
  //       stream: usersRef.snapshots(),
  //       builder: (context, snapshot) {
  //         if (!snapshot.hasData) {
  //           return circularProgress();
  //         }
  //         final List<Text> children = snapshot.data.documents
  //             .map((doc) => Text(doc['username']))
  //             .toList();
  //         return Container(
  //           child: ListView(
  //             children: children,
  //           ),
  //         );
  //       },
  //     ),
  //   );
  // }

  getFollowing() async {
    QuerySnapshot snapshot = await followingRef
        .document(currentUser.id)
        .collection('userFollowing')
        .getDocuments();

    setState(() {
      followingList = snapshot.documents.map((doc) => doc.documentID).toList();
    });
  }

  buildTimeline() {
    if (posts == null) {
      return circularProgress();
    } else if (posts.isEmpty) {
      return buildUsersToFollow();
    } else {
      return ListView(
        children: posts,
      );
    }
  }

  buildUsersToFollow() {
    return StreamBuilder(
      stream:
          usersRef.orderBy('timestamp', descending: true).limit(30).snapshots(),
      builder: (context, snapshot) {
        if (!snapshot.hasData) {
          return circularProgress();
        }
        List<UserResult> userResults = [];
        snapshot.data.documents.forEach((doc) {
          User user = User.fromDocument(doc);
          final bool isAuthUser = currentUser.id == user.id;
          final bool isFollowingUser = followingList.contains(user.id);
          // remove auth user from recommeded list
          if (isAuthUser) {
            return null;
          } else if (isFollowingUser) {
            return null;
          } else {
            UserResult userResult = UserResult(user);
            userResults.add(userResult);
          }
        });
        return Container(
          color: Theme.of(context).accentColor.withOpacity(0.2),
          child: Column(
            children: [
              Container(
                padding: EdgeInsets.all(12),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.person_add,
                      color: Theme.of(context).primaryColor,
                      size: 30,
                    ),
                    SizedBox(
                      width: 8,
                    ),
                    Text(
                      "Users to Follow",
                      style: TextStyle(
                          color: Theme.of(context).primaryColor, fontSize: 30),
                    )
                  ],
                ),
              ),
              Column(
                children: userResults,
              )
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: header(context, isAppTitle: true),
      body: RefreshIndicator(
        onRefresh: () => getTimeline(),
        child: buildTimeline(),
      ),
    );
  }
}
