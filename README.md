<img src="https://github.com/RocketChat/Rocket.Chat.Artwork/raw/master/Logos/2020/png/logo-horizontal-red.png" data-canonical-src="https://github.com/RocketChat/Rocket.Chat.Artwork/raw/master/Logos/2020/png/logo-horizontal-red.png" width="500" />

[Rocket.Chat](https://rocket.chat) is an open-source fully customizable communications platform developed in JavaScript for organizations with high standards of data protection.

We are a MERN based application enabling real-time conversations between colleagues, with other companies or with your customers, regardless of how they connect with you. The result is an increase in productivity and customer satisfaction rates.

Every day, tens of millions of users in over 150 countries and in organizations such as Deutsche Bahn, The US Navy, and Credit Suisse trust [Rocket.Chat](https://rocket.chat) to keep their communications completely private and secure.

 * [Review product documentation](https://docs.rocket.chat)
 * [Review developer documentation](https://developer.rocket.chat)
 
Using our self-managed offerings you can deploy Rocket.Chat on your own server, or you can use SaaS Rocket.Chat. We offer support for both community as well as commercial plans.
 
<img src="https://github.com/RocketChat/Rocket.Chat.Artwork/blob/master/Product%20Images/Welcome%20to%20RC%20(Readme).jpg" data-canonical-src="https://github.com/RocketChat/Rocket.Chat.Artwork/blob/master/Product%20Images/Welcome%20to%20RC%20(Readme).jpg" width="919" height="511" />

- base Dockerfile is from disney meteor base - https://github.com/disney/meteor-base
- to block modules from settings that will not be used in instance (should be done during installation) use SETTINGS_BLOCKED variable

```sh
export ADMIN_USERNAME=admin
export ADMIN_PASS=test123
export ADMIN_EMAIL=admin@mongrov.com

export SETTINGS_BLOCKED="AtlassianCrowd,Blockstack,Analytics,CAS,EmojiCustomFilesystem,CustomSoundsFilesystem,E2E Encryption,IRC_Federation,LDAP,LiveStream & Broadcasting,OTR,Search,SlackBridge,Smarsh,Webdav Integration,Meta,Logs,Bots,Federation,SAML,SMS,UserDataDownload,WebRTC,OAuth,Livechat"
export SETTINGS_HIDDEN="Video Conference,Threads,Discussion,Setup_Wizard,RetentionPolicy,Rate Limiter,Push,FileUpload,Email"
export SETTINGS_HIDDEN="Threads,Discussion,Setup_Wizard,RetentionPolicy,Rate Limiter,FileUpload,Message,Custom CSS,Colors,Custom_Scripts,User_Interface,theme-custom-css,Update,UTF8,UTF8,Show_Setup_Wizard,Reporting,Language,Language,REST API,Iframe_Integration,Translations,Stream_Cast,Assets"
# settings
export OVERWRITE_SETTING_Discussion_enabled=false
export OVERWRITE_SETTING_FileUpload_MaxFileSize="24857600"
export OVERWRITE_SETTING_FileUpload_Storage_Type="AmazonS3"

export OVERWRITE_SETTING_Message_AllowEditing=true
export OVERWRITE_SETTING_Message_AllowEditing_BlockEditInMinutes=1
export OVERWRITE_SETTING_Message_AllowDeleting=true
export OVERWRITE_SETTING_Message_AllowDeleting_BlockDeleteInMinutes=1
export OVERWRITE_SETTING_Message_ShowFormattingTips=false
export OVERWRITE_SETTING_Message_Read_Receipt_Enabled=true
export OVERWRITE_SETTING_Katex_Enabled=false
export OVERWRITE_SETTING_UI_DisplayRoles=false
export OVERWRITE_SETTING_UI_Use_Name_Avatar=true
export OVERWRITE_SETTING_UI_Use_Real_Name=true
export OVERWRITE_SETTING_UI_Allow_room_names_with_special_chars=true
export OVERWRITE_SETTING_Site_Name="mi.team"

# mail
export OVERWRITE_SETTING_SMTP_Protocol="smtp"
export OVERWRITE_SETTING_SMTP_Host="smtp.gmail.com"
export OVERWRITE_SETTING_SMTP_Port="587"
export OVERWRITE_SETTING_SMTP_IgnoreTLS=false
export OVERWRITE_SETTING_SMTP_Pool=true
export OVERWRITE_SETTING_SMTP_Username="notifications@mongrov.com"
export OVERWRITE_SETTING_SMTP_Password="Indic2018"
export OVERWRITE_SETTING_From_Email="notifications@mongrov.com"

```


## Cloud Hosted Rocket.Chat

https://cloud.rocket.chat/trial


## Installation
Please see the [requirements documentation](https://docs.rocket.chat/installing-and-updating/minimum-requirements-for-using-rocket.chat) for system requirements and more information about supported operating systems.
Please refer to [Install Rocket.Chat](https://rocket.chat/install) to install your Rocket.Chat instance.


## Feature Request 

[Rocket.Chat/feature-requests](https://github.com/RocketChat/feature-requests) is used to track Rocket.Chat feature requests and discussions. Click [here](https://github.com/RocketChat/feature-requests/issues/new?template=feature_request.md) to open a new feature request. [Feature Request Forums](https://forums.rocket.chat/c/feature-requests/8) stores the historical archives of old feature requests (up to 2018).

## Community

Join thousands of members worldwide in our [community server](https://open.rocket.chat).
Join [#Support](https://open.rocket.chat/channel/support) for help from our community with general Rocket.Chat questions.
Join [#Dev](https://open.rocket.chat/channel/dev) for needing help from the community to develop new features.
Talk with Rocket.Chat's leadership at the [Community Open Call](https://www.youtube.com/playlist?list=PLee3gqXJQrFVaxryc0OKTKc92yqQX9U-5), held monthly.  Join us for [the next Community Open Call](https://app.livestorm.co/rocket-chat/community-open-call?type=detailed).

## Contributions

Rocket.Chat is an open source project and we are very happy to accept community contributions. Please refer to the [How can I help?](https://docs.rocket.chat/contributors/how-can-i-help) for more details.

## Credits

* Emoji provided graciously by [JoyPixels](https://www.joypixels.com).
* Testing with [BrowserStack](https://www.browserstack.com).
* Translations done with [LingoHub](https://lingohub.com).


## Mobile Apps

In addition to the web interface, you can also download Rocket.Chat clients for:

[![Rocket.Chat on Apple App Store](https://user-images.githubusercontent.com/551004/29770691-a2082ff4-8bc6-11e7-89a6-964cd405ea8e.png)](https://itunes.apple.com/us/app/rocket-chat/id1148741252?mt=8) [![Rocket.Chat on Google Play](https://user-images.githubusercontent.com/551004/29770692-a20975c6-8bc6-11e7-8ab0-1cde275496e0.png)](https://play.google.com/store/apps/details?id=chat.rocket.android)  [![](https://user-images.githubusercontent.com/551004/48210349-50649480-e35e-11e8-97d9-74a4331faf3a.png)](https://f-droid.org/en/packages/chat.rocket.android)

## Learn More
* [API](https://developer.rocket.chat/reference/api)
* [See who's using Rocket.Chat](https://rocket.chat/customer-stories)

## Become a Rocketeer
We're hiring developers, support people, and product managers all the time. Please check our [jobs page](https://rocket.chat/jobs).

## Get the Latest News

* [Twitter](https://twitter.com/RocketChat)
* [Blog](https://rocket.chat/blog)
* [Facebook](https://www.facebook.com/RocketChatApp)
* [LinkedIn](https://www.linkedin.com/company/rocket-chat)
* [Youtube](https://www.youtube.com/channel/UCin9nv7mUjoqrRiwrzS5UVQ)
* [Email Newsletter](https://rocket.chat/newsletter)

Any other questions, reach out to us at [our website](https://rocket.chat/contact) or you can email us directly at [contact@rocket.chat](mailto:contact@rocket.chat). We’d be happy to help!


