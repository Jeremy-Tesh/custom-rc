import { getUserAvatarURL } from '../../../utils/lib/getUserAvatarURL';
import { settings } from '../../../settings';

export var generateContactSection = function(userObj) {
	var contact = {};
    contact["name"] = userObj.name;
    contact["label"] = userObj.customFields && userObj.customFields.Title ? userObj.customFields.Title : '';
    contact["picture"] = `${ settings.get('Site_Url') }${getUserAvatarURL(userObj.username)}`;
    const verifiedEmail = getVerifiedEmail(userObj);
    contact["email"] = verifiedEmail ? verifiedEmail.address : '';
    contact["summary"] = userObj.bio ? userObj.bio : '';

    // location: {
    //     address: source.address,
    //     postalCode: source.zipCode,
    //     city: source.location ? source.location.name : "",
    //     countryCode: countryCode,
    //     region: "",
    //   },
    contact["location"] = {
        address: userObj.customFields ? userObj.customFields['Address 1']+' '+userObj.customFields['Address 2'] : '',
        postalCode: userObj.customFields && userObj.customFields.Zipcode ? userObj.customFields.Zipcode : '',
        city: userObj.customFields && userObj.customFields.City ? userObj.customFields.City : userObj.customFields ? (userObj.customFields['Address 2']?userObj.customFields['Address 2'].split(",")[0]:'') : '',
        countryCode: '',
        region: '',
    }
    
    contact["profiles"] = [
        {
          network: "Twitter",
          username: userObj.customFields && userObj.customFields.Twitter ? userObj.customFields.Twitter.substring(userObj.customFields.Twitter.lastIndexOf('/')+1) :'',
          url: userObj.customFields && userObj.customFields.Twitter ? userObj.customFields.Twitter : '',
        },
        {
            network: "linkedin",
            username: userObj.customFields && userObj.customFields.LinkedIn ? userObj.customFields.LinkedIn.substring(userObj.customFields.LinkedIn.lastIndexOf('/')+1) :'',
            url: userObj.customFields && userObj.customFields.LinkedIn ? userObj.customFields.LinkedIn : '',
        },
        {
            network: "Facebook",
            username: userObj.customFields && userObj.customFields.Facebook ? userObj.customFields.Facebook.substring(userObj.customFields.Facebook.lastIndexOf('/')+1) :'',
            url: userObj.customFields && userObj.customFields.Facebook ? userObj.customFields.Facebook : '',
        },
        {
            network: "Instagram",
            username: userObj.customFields && userObj.customFields.Instagram ? userObj.customFields.Instagram.substring(userObj.customFields.Instagram.lastIndexOf('/')+1) :'',
            url: userObj.customFields && userObj.customFields.Instagram ? userObj.customFields.Instagram : '',
        },
    ]
    contact["phone"] = userObj.customFields && userObj.customFields['Phone No'] ? userObj.customFields['Phone No'] : '';

    return contact;
}

export var generateInterestsSection = function(userObj) {
    var interests = [{
        name: "Affiliations",
        keywords: userObj.customFields && userObj.customFields.Affliations ? userObj.customFields.Affliations : '',
    },
    {
        name: "Associations",
        keywords: userObj.customFields && userObj.customFields.Associations ? userObj.customFields.Associations : '',
    },
    {
        name: "Memberships",
        keywords: userObj.customFields && userObj.customFields.Memberships ? userObj.customFields.Memberships : '',
    }
    ];
    return interests;
}

export var getJsonData = function(stringData){
    var result = [];
    try {
        result = JSON.parse(stringData);
    } catch (error) {
        console.log(error);
    }
    return result;

}

var convertDate = function(date) {
	var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
	var splitDate = date.split('-');
	return MONTHS[parseInt(splitDate[1]-1)] + ", " + splitDate[0];
}

const getVerifiedEmail = (userObj) => {
    if (userObj && userObj.emails && Array.isArray(userObj.emails)) {
        return userObj.emails.find((email) => email.verified);
    }
    return false;
};



