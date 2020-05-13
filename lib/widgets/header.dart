import 'package:flutter/material.dart';

AppBar header(context, {bool isAppTitle = false, String titleText, removeBackButton = false}) {
  return AppBar(
    automaticallyImplyLeading: !removeBackButton,
    title: Text(
      isAppTitle ? 'FlutterShare': titleText,
      style: TextStyle(
        color: Colors.white,
        fontFamily: isAppTitle ?  'Signatra' : '',
        fontSize: isAppTitle ?  50.0: 22.0,
      ),
    ),
    centerTitle: true,
    backgroundColor: Theme.of(context).accentColor,
  );
}
