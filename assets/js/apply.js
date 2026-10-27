/* Koki & Khabib Animal Aid: application form (standard lane). */
(function () {
  'use strict';
  var KK = window.KK;
  var MED = ['vet_treatment', 'medicines', 'diagnostics', 'wound_care', 'surgery', 'followup_care', 'boarding', 'sterilisation', 'vaccination'];
  var CRITICAL = ['hit_vehicle', 'bleeding', 'cannot_stand', 'breathing', 'maggots', 'poisoning', 'seizures', 'fracture', 'birth_difficulty', 'burns'];
  var isMed = function (d) { return MED.indexOf(d.category) >= 0; };
  var clinicDigits = function (v) { var d = String(v || '').replace(/\D/g, ''); return d.length >= 8 && d.length <= 13 ? null : { en: 'Enter the clinic phone number (mobile or landline).', hi: 'क्लिनिक का फ़ोन नंबर लिखें (मोबाइल या लैंडलाइन)।' }; };

  KK.APPLY_STEPS = [
    {
      key: 'you', title: { en: 'About you', hi: 'आपके बारे में' },
      intro: { en: 'Takes about 5 minutes. Your answers are saved on this phone as you go.', hi: 'लगभग 5 मिनट लगेंगे। आपके जवाब साथ-साथ इस फ़ोन पर सहेजे जाते हैं।' },
      fields: [
        { name: 'role', type: 'radio', required: true, cols: 2, label: { en: 'Which describes you best?', hi: 'आपके बारे में सबसे सही क्या है?' }, options: [
          { value: 'citizen', icon: '🙋', label: { en: 'I found an animal that needs help', hi: 'मुझे एक जानवर मिला जिसे मदद चाहिए' } },
          { value: 'feeder', icon: '🍚', label: { en: 'I feed or care for community animals', hi: 'मैं सामुदायिक जानवरों को खाना खिलाता/खिलाती हूँ या देखभाल करता/करती हूँ' } },
          { value: 'rescuer', icon: '🚑', label: { en: 'Independent rescuer', hi: 'स्वतंत्र रेस्क्यूअर' } },
          { value: 'foster', icon: '🏠', label: { en: 'Foster caregiver', hi: 'फ़ॉस्टर देखभालकर्ता' } },
          { value: 'vet', icon: '🩺', label: { en: 'Vet or clinic referring a case', hi: 'केस भेजने वाले डॉक्टर या क्लिनिक' } },
          { value: 'ngo', icon: '🤝', label: { en: 'NGO or shelter referring a case', hi: 'केस भेजने वाला NGO या शेल्टर' } },
        ] },
        { name: 'name', type: 'text', required: true, minLength: 2, maxlength: 80, autocomplete: 'name', label: { en: 'Your full name', hi: 'आपका पूरा नाम' } },
        { name: 'phone', type: 'tel', required: true, prefix: '+91', autocomplete: 'tel-national', maxlength: 15, label: { en: 'Mobile number (WhatsApp if possible)', hi: 'मोबाइल नंबर (हो सके तो WhatsApp वाला)' },
          help: { en: 'We will only contact you about this request.', hi: 'हम आपसे केवल इसी अनुरोध के बारे में संपर्क करेंगे।' } },
        { name: 'instagram', type: 'text', maxlength: 120, label: { en: 'Instagram handle, or another way people know you', hi: 'Instagram हैंडल, या लोग आपको और कैसे जानते हैं' },
          help: { en: 'Helps us verify, e.g. @yourname, or the rescue group you work with.', hi: 'जाँच में मदद करता है, जैसे @yourname, या जिस रेस्क्यू ग्रुप के साथ आप काम करते हैं।' } },
        { name: 'email', type: 'email', maxlength: 120, autocomplete: 'email', label: { en: 'Email', hi: 'ईमेल' } },
        { name: 'partnerCode', type: 'text', maxlength: 12, placeholder: { en: 'KKP-01', hi: 'KKP-01' }, label: { en: 'Partner code (if a vet or rescuer gave you one)', hi: 'पार्टनर कोड (अगर किसी डॉक्टर या रेस्क्यूअर ने दिया हो)' },
          validate: function (v) { return /^KKP-\d{2,3}$/i.test(String(v).trim()) ? null : { en: 'Partner codes look like KKP-01.', hi: 'पार्टनर कोड ऐसा दिखता है: KKP-01' }; } },
        { name: 'heardFrom', type: 'select', label: { en: 'How did you hear about us?', hi: 'आपको हमारे बारे में कैसे पता चला?' }, options: [
          { value: 'instagram', label: { en: 'Instagram', hi: 'Instagram' } }, { value: 'vet', label: { en: 'A vet or clinic', hi: 'किसी डॉक्टर या क्लिनिक से' } },
          { value: 'rescuer', label: { en: 'A rescuer or feeder', hi: 'किसी रेस्क्यूअर या फ़ीडर से' } }, { value: 'friend', label: { en: 'A friend', hi: 'किसी दोस्त से' } },
          { value: 'other', label: { en: 'Other', hi: 'अन्य' } }] },
      ],
    },
    {
      key: 'animal', title: { en: 'The animal', hi: 'जानवर' },
      fields: [
        { name: 'species', type: 'radio', required: true, cols: 3, label: { en: 'What animal is it?', hi: 'कौन-सा जानवर है?' }, options: [
          { value: 'dog', icon: '🐕', label: { en: 'Dog', hi: 'कुत्ता' } }, { value: 'cat', icon: '🐈', label: { en: 'Cat', hi: 'बिल्ली' } },
          { value: 'cow', icon: '🐄', label: { en: 'Cow / cattle', hi: 'गाय / मवेशी' } }, { value: 'bird', icon: '🐦', label: { en: 'Bird', hi: 'पक्षी' } },
          { value: 'goat', icon: '🐐', label: { en: 'Goat', hi: 'बकरी' } }, { value: 'horse', icon: '🐎', label: { en: 'Horse / donkey', hi: 'घोड़ा / गधा' } },
          { value: 'other', icon: '➕', label: { en: 'Other', hi: 'अन्य' } }] },
        { name: 'speciesOther', type: 'text', required: true, maxlength: 60, show: function (d) { return d.species === 'other'; }, label: { en: 'Which animal?', hi: 'कौन-सा जानवर?' } },
        { name: 'animalStatus', type: 'radio', required: true, label: { en: 'Who does the animal belong to?', hi: 'यह जानवर किसका है?' }, options: [
          { value: 'stray', label: { en: 'Stray: no one looks after it', hi: 'आवारा: कोई देखभाल नहीं करता' } },
          { value: 'community', label: { en: 'Community animal: people in the area feed or care for it', hi: 'सामुदायिक जानवर: इलाके के लोग खिलाते या देखभाल करते हैं' } },
          { value: 'abandoned', label: { en: 'Abandoned pet', hi: 'छोड़ा गया पालतू' } },
          { value: 'injured_unknown', label: { en: 'Injured, not sure', hi: 'घायल, पता नहीं' } },
          { value: 'owned', label: { en: 'It has an owner (a pet)', hi: 'इसका मालिक है (पालतू)' } }] },
        { name: 'ownedNote', type: 'note', tone: '', show: function (d) { return d.animalStatus === 'owned'; },
          html: { en: 'We mostly help animals without owners. For pets we can only consider real financial hardship, and cosmetic or elective procedures are never funded.',
            hi: 'हम ज़्यादातर बिना मालिक वाले जानवरों की मदद करते हैं। पालतू जानवरों के लिए हम केवल असली आर्थिक कठिनाई में ही विचार कर सकते हैं, और कॉस्मेटिक या ग़ैर-ज़रूरी प्रक्रियाओं का खर्च कभी नहीं उठाते।' } },
        { name: 'ownedHardship', type: 'textarea', required: true, minLength: 20, maxlength: 1500, show: function (d) { return d.animalStatus === 'owned'; },
          label: { en: 'Please explain the financial hardship', hi: 'कृपया आर्थिक कठिनाई के बारे में बताएँ' } },
        { name: 'area', type: 'text', required: true, minLength: 2, maxlength: 120, label: { en: 'Where in Mumbai is the animal?', hi: 'जानवर मुंबई में कहाँ है?' },
          placeholder: { en: 'e.g. Andheri West, near the station', hi: 'जैसे अंधेरी पश्चिम, स्टेशन के पास' } },
        { name: 'pincode', type: 'text', kind: 'pincode', inputmode: 'numeric', maxlength: 6, label: { en: 'Pincode', hi: 'पिनकोड' },
          help: { en: 'Helps us confirm the location is within Mumbai.', hi: 'इससे हम पुष्टि कर पाते हैं कि जगह मुंबई के अंदर है।' } },
        { name: 'prevCaseRef', type: 'text', maxlength: 12, placeholder: { en: 'KK-2611-0007', hi: 'KK-2611-0007' },
          label: { en: 'Have we helped this animal before? Its Case ID', hi: 'क्या हमने इस जानवर की पहले मदद की है? उसका केस ID' },
          validate: function (v) { return /^KK-\d{4}-\d{4}$/i.test(String(v).trim()) ? null : { en: 'Case IDs look like KK-2611-0007.', hi: 'केस ID ऐसा दिखता है: KK-2611-0007' }; } },
      ],
    },
    {
      key: 'need', title: { en: 'What help is needed', hi: 'किस मदद की ज़रूरत है' },
      fields: [
        { name: 'category', type: 'radio', required: true, cols: 2, label: { en: 'What is the money mainly for?', hi: 'पैसे मुख्य रूप से किस लिए चाहिए?' }, options: [
          { value: 'vet_treatment', icon: '🩺', label: { en: 'Vet consultation & treatment', hi: 'डॉक्टर को दिखाना और इलाज' } },
          { value: 'medicines', icon: '💊', label: { en: 'Medicines', hi: 'दवाइयाँ' } },
          { value: 'diagnostics', icon: '🔬', label: { en: 'Tests (blood test, X-ray, scan)', hi: 'जाँच (ब्लड टेस्ट, एक्स-रे, स्कैन)' } },
          { value: 'wound_care', icon: '🩹', label: { en: 'Wound care & dressing', hi: 'घाव की देखभाल और ड्रेसिंग' } },
          { value: 'surgery', icon: '🏥', label: { en: 'Surgery (medically necessary)', hi: 'ऑपरेशन (इलाज के लिए ज़रूरी)' } },
          { value: 'followup_care', icon: '🔁', label: { en: 'Follow-up treatment / recovery', hi: 'आगे का इलाज / रिकवरी' } },
          { value: 'boarding', icon: '🛏️', label: { en: 'Medical boarding / recovery stay', hi: 'इलाज के दौरान रखने / रिकवरी की जगह' } },
          { value: 'sterilisation', icon: '✂️', label: { en: 'Sterilisation', hi: 'नसबंदी' } },
          { value: 'vaccination', icon: '💉', label: { en: 'Vaccination', hi: 'टीकाकरण' } },
          { value: 'food', icon: '🍚', label: { en: 'Food for community animals', hi: 'सामुदायिक जानवरों के लिए खाना' } },
          { value: 'transport', icon: '🛺', label: { en: 'Transport to a vet', hi: 'डॉक्टर तक ले जाने का किराया' } },
          { value: 'other', icon: '➕', label: { en: 'Something else', hi: 'कुछ और' } }] },
        { name: 'conditions', type: 'checks', cols: 2, show: function (d) { return isMed(d) || d.category === 'transport' || d.category === 'other'; },
          label: { en: 'What do you see? (tick all that apply)', hi: 'आपको क्या दिख रहा है? (जो लागू हों, सब चुनें)' }, options: [
            { value: 'hit_vehicle', label: { en: 'Hit by a vehicle', hi: 'गाड़ी से टक्कर' } }, { value: 'bleeding', label: { en: 'Bleeding', hi: 'खून बह रहा है' } },
            { value: 'cannot_stand', label: { en: "Can't stand or walk", hi: 'खड़ा नहीं हो पा रहा / चल नहीं पा रहा' } }, { value: 'breathing', label: { en: 'Breathing difficulty', hi: 'साँस लेने में तकलीफ़' } },
            { value: 'maggots', label: { en: 'Maggot wound', hi: 'घाव में कीड़े' } }, { value: 'poisoning', label: { en: 'Suspected poisoning', hi: 'ज़हर का शक' } },
            { value: 'seizures', label: { en: 'Seizures / fits', hi: 'दौरे पड़ना' } }, { value: 'fracture', label: { en: 'Broken bone', hi: 'हड्डी टूटी है' } },
            { value: 'birth_difficulty', label: { en: 'Difficulty giving birth', hi: 'बच्चे देने में तकलीफ़' } }, { value: 'burns', label: { en: 'Burns', hi: 'जलने के घाव' } },
            { value: 'wound', label: { en: 'Wound / injury', hi: 'घाव / चोट' } }, { value: 'skin', label: { en: 'Skin problem', hi: 'त्वचा की बीमारी' } },
            { value: 'not_eating', label: { en: 'Not eating', hi: 'खाना नहीं खा रहा' } }, { value: 'eye', label: { en: 'Eye problem', hi: 'आँख की समस्या' } },
            { value: 'limping', label: { en: 'Limping', hi: 'लंगड़ा रहा है' } }, { value: 'weak', label: { en: 'Very weak', hi: 'बहुत कमज़ोर' } },
            { value: 'vomiting', label: { en: 'Vomiting / diarrhoea', hi: 'उल्टी / दस्त' } }, { value: 'other', label: { en: 'Other', hi: 'अन्य' } }] },
        { name: 'urgentNote', type: 'note', tone: 'red',
          show: function (d) { return (d.conditions || []).some(function (c) { return CRITICAL.indexOf(c) >= 0; }); },
          html: { en: "<b>This sounds urgent.</b> If the animal is not with a vet yet, please take it to one now. We review requests every evening, so we can't promise an immediate reply.",
            hi: '<b>यह गंभीर लगता है।</b> अगर जानवर अभी तक डॉक्टर के पास नहीं है, तो कृपया उसे अभी ले जाएँ। हम हर शाम अनुरोधों की समीक्षा करते हैं, इसलिए तुरंत जवाब का वादा नहीं कर सकते।' } },
        { name: 'animalDesc', type: 'textarea', required: true, minLength: 10, maxlength: 2000, label: { en: 'Describe the animal and its condition', hi: 'जानवर और उसकी हालत के बारे में बताएँ' },
          help: { en: 'What happened, since when, and how it is now.', hi: 'क्या हुआ, कब से, और अभी कैसी हालत है।' } },
        { name: 'assistanceDesc', type: 'textarea', required: true, minLength: 5, maxlength: 2000, label: { en: 'What exactly will the money pay for?', hi: 'पैसे से ठीक-ठीक क्या खर्च होगा?' },
          help: { en: 'e.g. X-ray + 5 days of antibiotics prescribed at ___ clinic.', hi: 'जैसे ___ क्लिनिक में लिखा गया एक्स-रे + 5 दिन की एंटीबायोटिक।' } },
        { name: 'needs', type: 'textarea', maxlength: 1000, show: function (d) { return d.category === 'food' || d.category === 'medicines'; },
          label: { en: 'Food or medicine details (what, how much, for how long)', hi: 'खाने या दवा की जानकारी (क्या, कितना, कितने दिन)' } },
        { name: 'prevTreatment', type: 'textarea', maxlength: 1500, label: { en: 'Treatment or help given so far', hi: 'अब तक क्या इलाज या मदद हुई है' } },
        { name: 'urgency', type: 'radio', required: true, cols: 2, label: { en: 'How soon is the money needed?', hi: 'पैसे कितनी जल्दी चाहिए?' }, options: [
          { value: 'today', label: { en: 'Today, it cannot wait', hi: 'आज ही, रुक नहीं सकते' } }, { value: 'three_days', label: { en: 'Within 3 days', hi: '3 दिन के अंदर' } },
          { value: 'two_weeks', label: { en: 'Within 2 weeks', hi: '2 हफ़्ते के अंदर' } }, { value: 'routine', label: { en: 'No fixed date', hi: 'कोई तय तारीख़ नहीं' } }] },
      ],
    },
    {
      key: 'money', title: { en: 'The money', hi: 'पैसों की जानकारी' },
      fields: [
        { name: 'amount', type: 'number', required: true, min: 1, max: 500000, prefix: '₹', maxlength: 7, label: { en: 'How much do you need from us?', hi: 'आपको हमसे कितनी राशि चाहिए?' },
          help: { en: 'Only the shortfall: the part you cannot cover yourself.', hi: 'केवल कमी वाली राशि: वह हिस्सा जो आप खुद नहीं दे पा रहे।' } },
        { name: 'shortfallReason', type: 'textarea', required: true, minLength: 5, maxlength: 1500, label: { en: "Why can't you cover this yourself?", hi: 'आप यह खर्च खुद क्यों नहीं उठा पा रहे हैं?' } },
        { name: 'ifNotFunded', type: 'radio', required: true, label: { en: 'What happens if this is not funded?', hi: 'अगर यह मदद नहीं मिली तो क्या होगा?' }, options: [
          { value: 'cannot_start', label: { en: 'Treatment or care cannot start', hi: 'इलाज या देखभाल शुरू नहीं हो पाएगी' } },
          { value: 'will_stop', label: { en: 'Treatment that has started will have to stop', hi: 'शुरू हुआ इलाज रोकना पड़ेगा' } },
          { value: 'delayed', label: { en: 'It will be delayed', hi: 'इसमें देरी होगी' } },
          { value: 'manage', label: { en: "We'll manage somehow", hi: 'हम किसी तरह संभाल लेंगे' } }] },
        { name: 'partialHelps', type: 'radio', required: true, cols: 2, label: { en: 'Would part of the amount still help?', hi: 'क्या आधी-अधूरी राशि से भी मदद होगी?' }, options: [
          { value: 'Y', label: { en: 'Yes, even part helps', hi: 'हाँ, थोड़ा भी मदद करेगा' } }, { value: 'N', label: { en: 'No, only the full amount', hi: 'नहीं, पूरी राशि ही चाहिए' } }] },
        { name: 'otherFunding', type: 'radio', required: true, cols: 2, label: { en: 'Has any money been raised from others for this?', hi: 'क्या इसके लिए किसी और से पैसे मिले हैं?' }, options: [
          { value: 'N', label: { en: 'No', hi: 'नहीं' } }, { value: 'Y', label: { en: 'Yes', hi: 'हाँ' } }] },
        { name: 'otherFundingAmount', type: 'number', min: 0, max: 1000000, prefix: '₹', maxlength: 7, show: function (d) { return d.otherFunding === 'Y'; }, required: true, label: { en: 'How much so far?', hi: 'अब तक कितना?' } },
        { name: 'otherFundingFrom', type: 'text', maxlength: 300, show: function (d) { return d.otherFunding === 'Y'; }, label: { en: 'From whom?', hi: 'किससे?' } },
        { name: 'otherSupporters', type: 'text', maxlength: 500, label: { en: 'Is anyone else helping with this animal?', hi: 'क्या कोई और इस जानवर की मदद कर रहा है?' },
          help: { en: 'Names of people or groups, if any.', hi: 'अगर हैं, तो लोगों या ग्रुप के नाम।' } },
      ],
    },
    {
      key: 'payment', title: { en: 'Clinic & payment', hi: 'क्लिनिक और भुगतान' },
      intro: { en: 'We prefer to pay the vet, pharmacy or supplier <b>directly</b>. It keeps things simple and safe for everyone.', hi: 'हम डॉक्टर, फ़ार्मेसी या सप्लायर को <b>सीधे</b> भुगतान करना पसंद करते हैं। इससे सबके लिए काम आसान और सुरक्षित रहता है।' },
      fields: [
        { name: 'clinicInvolved', type: 'radio', required: true, label: { en: 'Is a vet or clinic involved?', hi: 'क्या कोई डॉक्टर या क्लिनिक जुड़ा है?' }, options: [
          { value: 'yes', label: { en: 'Yes', hi: 'हाँ' } }, { value: 'not_yet', label: { en: 'Not yet, the animal still needs to be taken', hi: 'अभी नहीं, जानवर को ले जाना बाकी है' } },
          { value: 'no', label: { en: 'No vet needed (food / transport)', hi: 'डॉक्टर की ज़रूरत नहीं (खाना / किराया)' } }] },
        { name: 'clinicName', type: 'text', maxlength: 120, show: function (d) { return d.clinicInvolved === 'yes' || d.payeeType === 'clinic'; },
          required: function (d) { return d.payeeType === 'clinic' || Number(d.amount) > 3000; }, label: { en: 'Clinic or vet name', hi: 'क्लिनिक या डॉक्टर का नाम' } },
        { name: 'clinicPhone', type: 'text', inputmode: 'tel', maxlength: 16, show: function (d) { return d.clinicInvolved === 'yes' || d.payeeType === 'clinic'; },
          required: function (d) { return Number(d.amount) > 3000; }, validate: clinicDigits, label: { en: 'Clinic phone number', hi: 'क्लिनिक का फ़ोन नंबर' },
          help: { en: 'For larger amounts we call the clinic to confirm. This is routine.', hi: 'बड़ी राशि के लिए हम पुष्टि के लिए क्लिनिक को फ़ोन करते हैं। यह सामान्य प्रक्रिया है।' } },
        { name: 'clinicArea', type: 'text', maxlength: 120, show: function (d) { return d.clinicInvolved === 'yes' || d.payeeType === 'clinic'; }, label: { en: 'Clinic area', hi: 'क्लिनिक का इलाका' } },
        { name: 'payeeType', type: 'radio', required: true, label: { en: 'Who should we pay?', hi: 'हम किसे भुगतान करें?' }, options: [
          { value: 'clinic', label: { en: 'The clinic or hospital', hi: 'क्लिनिक या अस्पताल' }, desc: { en: 'Recommended', hi: 'सबसे अच्छा' } },
          { value: 'pharmacy', label: { en: 'A pharmacy / medical store', hi: 'फ़ार्मेसी / मेडिकल स्टोर' } },
          { value: 'supplier', label: { en: 'A food or supply shop', hi: 'खाने या सामान की दुकान' } },
          { value: 'transport', label: { en: 'Ambulance or transport provider', hi: 'एम्बुलेंस या गाड़ी वाला' } },
          { value: 'self', label: { en: 'Me: I already paid (reimbursement)', hi: 'मुझे: मैंने पहले ही भुगतान कर दिया है (वापसी)' }, desc: { en: 'Bills and proof of payment needed', hi: 'बिल और भुगतान का सबूत ज़रूरी' } },
          { value: 'self_advance', label: { en: "Me: I'll buy it and share the bills", hi: 'मुझे: मैं खरीदकर बिल भेजूँगा/भेजूँगी' }, desc: { en: 'Small amounts only (up to ₹500)', hi: 'केवल छोटी राशि (₹500 तक)' } },
          { value: 'other', label: { en: 'Someone else', hi: 'किसी और को' } }] },
        { name: 'payeeName', type: 'text', maxlength: 80, required: function (d) { return d.payeeType && d.payeeType !== 'clinic'; },
          show: function (d) { return !!d.payeeType; }, label: { en: 'Name of the person or business we would pay', hi: 'जिस व्यक्ति या दुकान/संस्था को भुगतान करना है, उसका नाम' } },
        { name: 'payeeUPI', type: 'text', kind: 'upi', maxlength: 80, show: function (d) { return !!d.payeeType; },
          required: function (d) { return ['self', 'self_advance', 'other'].indexOf(d.payeeType) >= 0; },
          label: { en: 'UPI ID for the payment', hi: 'भुगतान के लिए UPI ID' }, placeholder: { en: 'name@bank', hi: 'name@bank' },
          help: { en: "If paying a clinic or shop, ask them for their UPI ID. We always check the name your payee's UPI shows before paying.", hi: 'अगर क्लिनिक या दुकान को भुगतान करना है, तो उनसे UPI ID पूछ लें। भुगतान से पहले हम हमेशा UPI पर दिखने वाला नाम जाँचते हैं।' } },
        { name: 'payeeRelation', type: 'text', maxlength: 80, required: true, show: function (d) { return d.payeeType === 'other'; },
          label: { en: 'Who is this person to you, and why should they be paid?', hi: 'यह व्यक्ति आपका कौन है, और उन्हें भुगतान क्यों करना है?' } },
        { name: 'advanceNote', type: 'note', show: function (d) { return d.payeeType === 'self_advance'; },
          html: { en: 'Paying people directly is limited to small amounts (up to ₹500). For anything bigger we will ask for the shop or clinic details so we can pay them.',
            hi: 'सीधे व्यक्ति को भुगतान केवल छोटी राशि (₹500 तक) तक सीमित है। इससे ज़्यादा के लिए हम दुकान या क्लिनिक की जानकारी माँगेंगे ताकि उन्हें भुगतान कर सकें।' } },
      ],
    },
    {
      key: 'evidence', title: { en: 'Photos & documents', hi: 'फ़ोटो और दस्तावेज़' },
      fields: [
        { name: 'tierNote', type: 'note', tone: 'teal', html: function (d) {
          var a = Number(d.amount) || 0;
          if (a > 3000) return { en: '<b>For ' + KK.inr(a) + ' we need:</b> photos of the animal, the vet\'s itemised estimate (or bill), and the clinic\'s phone number. We will call the clinic and pay them directly, possibly in stages.',
            hi: '<b>' + KK.inr(a) + ' के लिए हमें चाहिए:</b> जानवर की फ़ोटो, डॉक्टर का विस्तृत एस्टिमेट (या बिल), और क्लिनिक का फ़ोन नंबर। हम क्लिनिक को फ़ोन करेंगे और सीधे उन्हें भुगतान करेंगे, हो सकता है किस्तों में।' };
          if (a > 1000) return { en: '<b>For ' + KK.inr(a) + ' we need:</b> photos of the animal and a vet prescription, estimate or bill' + (d.category === 'food' || d.category === 'transport' ? ' (or a shop quote/bill)' : '') + '.',
            hi: '<b>' + KK.inr(a) + ' के लिए हमें चाहिए:</b> जानवर की फ़ोटो और डॉक्टर का पर्चा, एस्टिमेट या बिल' + (d.category === 'food' || d.category === 'transport' ? ' (या दुकान का कोटेशन/बिल)' : '') + '।' };
          return { en: '<b>For ' + KK.inr(a) + ' we need:</b> clear photos of the animal. Any prescription or bill you have helps too.',
            hi: '<b>' + KK.inr(a) + ' के लिए हमें चाहिए:</b> जानवर की साफ़ फ़ोटो। आपके पास कोई पर्चा या बिल हो तो वह भी मदद करता है।' };
        } },
        { name: 'f_photo', type: 'files', kind: 'animal_photo', media: 'image', required: true, max: 5, label: { en: 'Photos of the animal (showing the problem)', hi: 'जानवर की फ़ोटो (समस्या दिखाते हुए)' },
          help: { en: 'Please take fresh photos. Up to 5.', hi: 'कृपया अभी की फ़ोटो लें। अधिकतम 5।' } },
        { name: 'f_prescription', type: 'files', kind: 'prescription', media: 'doc', max: 3, show: isMed, label: { en: "Vet's prescription", hi: 'डॉक्टर का पर्चा' } },
        { name: 'f_estimate', type: 'files', kind: 'estimate', media: 'doc', max: 3, label: { en: 'Estimate or quotation', hi: 'एस्टिमेट या कोटेशन' } },
        { name: 'f_bill', type: 'files', kind: 'bill', media: 'doc', max: 3, label: { en: 'Bills or invoices', hi: 'बिल या इनवॉइस' } },
        { name: 'f_proof', type: 'files', kind: 'payment_proof', media: 'doc', max: 3, show: function (d) { return d.payeeType === 'self'; },
          label: { en: 'Proof you paid (UPI screenshot or receipt)', hi: 'आपके भुगतान का सबूत (UPI स्क्रीनशॉट या रसीद)' } },
        { name: 'f_video', type: 'files', kind: 'animal_video', media: 'video', max: 1, label: { en: 'A short video (up to 20 MB)', hi: 'एक छोटा वीडियो (20 MB तक)' } },
        { name: 'f_other', type: 'files', kind: 'other_doc', media: 'doc', max: 3, label: { en: 'Anything else that helps', hi: 'कुछ और जो मदद करे' } },
        { name: 'laterNote', type: 'note', html: { en: "Don't have a document yet? You can still submit. You'll be able to add it later with your Case ID.", hi: 'अभी कोई दस्तावेज़ नहीं है? फिर भी आप जमा कर सकते हैं। बाद में अपने केस ID से जोड़ पाएँगे।' } },
      ],
    },
  ];

  KK.CONSENT_FIELDS = [
    { name: 'consentData', type: 'checkbox', required: true, label: { en: 'I agree that Koki & Khabib Animal Aid may store these details privately and contact me about this request.', hi: 'मैं सहमत हूँ कि Koki & Khabib Animal Aid ये जानकारी निजी रूप से रख सकता है और इस अनुरोध के बारे में मुझसे संपर्क कर सकता है।' },
      help: { en: 'See our privacy page. We never share your details.', hi: 'हमारा प्राइवेसी पेज देखें। हम आपकी जानकारी कभी साझा नहीं करते।' } },
    { name: 'declaration', type: 'checkbox', required: true, label: { en: 'The information is true. I understand help is discretionary, not guaranteed, and depends on checks and the money available.', hi: 'यह जानकारी सच है। मैं समझता/समझती हूँ कि मदद विवेक पर निर्भर है, गारंटी नहीं है, और जाँच व उपलब्ध राशि पर निर्भर करती है।' } },
    { name: 'consentShare', type: 'checkbox', label: { en: "You may share this animal's story on Instagram without my name or contact details.", hi: 'आप इस जानवर की कहानी Instagram पर मेरे नाम या संपर्क के बिना साझा कर सकते हैं।' } },
  ];

  /** Builds the payload the server validates (field names match kkValidateForm). */
  KK.toServerForm = function (d, lane) {
    var trim = function (v) { return String(v === undefined || v === null ? '' : v).trim(); };
    var clinicShown = d.clinicInvolved === 'yes' || d.payeeType === 'clinic' || lane === 'Emergency';
    return {
      role: d.role, name: trim(d.name), phone: trim(d.phone), email: trim(d.email), instagram: trim(d.instagram), partnerCode: trim(d.partnerCode).toUpperCase(),
      heardFrom: d.heardFrom || '', species: d.species, speciesOther: d.species === 'other' ? trim(d.speciesOther) : '', animalStatus: d.animalStatus,
      ownedHardship: d.animalStatus === 'owned' ? trim(d.ownedHardship) : '', area: trim(d.area), pincode: trim(d.pincode), conditions: d.conditions || [],
      animalDesc: trim(d.animalDesc), prevCaseRef: trim(d.prevCaseRef).toUpperCase(), prevTreatment: trim(d.prevTreatment), category: d.category,
      assistanceDesc: trim(d.assistanceDesc), needs: trim(d.needs), amount: Math.round(Number(String(d.amount).replace(/[^\d.]/g, ''))) || 0,
      shortfallReason: trim(d.shortfallReason), ifNotFunded: d.ifNotFunded, partialHelps: d.partialHelps, otherFunding: d.otherFunding,
      otherFundingAmount: d.otherFunding === 'Y' ? (Math.round(Number(String(d.otherFundingAmount).replace(/[^\d.]/g, ''))) || 0) : '',
      otherFundingFrom: d.otherFunding === 'Y' ? trim(d.otherFundingFrom) : '', otherSupporters: trim(d.otherSupporters), urgency: d.urgency,
      clinicInvolved: d.clinicInvolved, clinicName: clinicShown ? trim(d.clinicName) : '', clinicPhone: clinicShown ? trim(d.clinicPhone) : '',
      clinicArea: clinicShown ? trim(d.clinicArea) : '', payeeType: d.payeeType, payeeName: trim(d.payeeName), payeeUPI: trim(d.payeeUPI).toLowerCase(),
      payeeRelation: d.payeeType === 'other' ? trim(d.payeeRelation) : '', consentData: d.consentData === true, consentShare: d.consentShare === true,
      declaration: d.declaration === true, lang: KK.lang(),
    };
  };

  var DOC = {
    photo: { en: 'A clear photo of the animal showing the problem', hi: 'जानवर की साफ़ फ़ोटो, जिसमें समस्या दिखे' },
    vet_doc: { en: "The vet's prescription, estimate or bill", hi: 'डॉक्टर का पर्चा, एस्टिमेट या बिल' },
    quote: { en: 'A quote or bill from the shop or supplier', hi: 'दुकान या सप्लायर का कोटेशन या बिल' },
    itemised: { en: 'An itemised estimate from the clinic', hi: 'क्लिनिक का विस्तृत एस्टिमेट' },
    clinic_contact: { en: "The clinic's name and phone number", hi: 'क्लिनिक का नाम और फ़ोन नंबर' },
    bill: { en: 'The original bill', hi: 'मूल बिल' },
    payment_proof: { en: 'Proof of your payment', hi: 'आपके भुगतान का सबूत' },
    payee_details: { en: 'Who we should pay: name and UPI ID', hi: 'किसे भुगतान करना है: नाम और UPI ID' },
  };
  KK.DOC_LABELS = DOC;

  /** Success screen shared by the standard and emergency forms. */
  KK.successHtml = function (caseId, missing, failed, emergency) {
    var miss = (missing || []).filter(function (m) { return DOC[m]; });
    return '<div class="done-box"><div style="font-size:44px" aria-hidden="true">🐾</div><h2>' + KK.bi({ en: 'Request received', hi: 'अनुरोध मिल गया' }) + '</h2>' +
      '<p>' + KK.bi({ en: 'Your Case ID (please take a screenshot):', hi: 'आपका केस ID (कृपया स्क्रीनशॉट ले लें):' }) + '</p><div class="case-id">' + KK.esc(caseId) + '</div></div>' +
      (failed ? '<div class="notice red"><p>' + KK.bi({ en: failed + ' file(s) did not upload. You can add them on the follow-up page.', hi: failed + ' फ़ाइल अपलोड नहीं हुई। आप उन्हें फ़ॉलो-अप पेज पर जोड़ सकते हैं।' }) + '</p></div>' : '') +
      '<div class="card" style="margin:14px 0"><h3>' + KK.bi({ en: 'What happens next', hi: 'आगे क्या होगा' }) + '</h3><ol class="list-plain">' +
      (emergency
        ? '<li>' + KK.bi({ en: 'Emergency requests reach us immediately. During waking hours we aim to respond within a few hours.', hi: 'आपातकालीन अनुरोध हमें तुरंत मिलते हैं। दिन के समय हम कुछ घंटों में जवाब देने की कोशिश करते हैं।' }) + '</li>' +
          '<li>' + KK.bi({ en: 'We will call the clinic and, if we can help, pay the clinic directly.', hi: 'हम क्लिनिक को फ़ोन करेंगे और अगर मदद कर सके, तो सीधे क्लिनिक को भुगतान करेंगे।' }) + '</li>'
        : '<li>' + KK.bi({ en: 'We review requests every evening.', hi: 'हम हर शाम अनुरोधों की समीक्षा करते हैं।' }) + '</li>' +
          '<li>' + KK.bi({ en: 'If we need anything, we will WhatsApp you. We may also call the clinic. This is routine.', hi: 'अगर हमें कुछ चाहिए होगा, तो हम आपको WhatsApp करेंगे। हम क्लिनिक को फ़ोन भी कर सकते हैं। यह सामान्य है।' }) + '</li>') +
      '<li>' + KK.bi({ en: 'If approved, we pay the vet, pharmacy or supplier directly and send you the reference.', hi: 'मंज़ूरी मिलने पर हम सीधे डॉक्टर, फ़ार्मेसी या सप्लायर को भुगतान करेंगे और आपको रेफ़रेंस भेजेंगे।' }) + '</li></ol></div>' +
      (miss.length ? '<div class="notice"><p><b>' + KK.bi({ en: 'To decide, we will also need:', hi: 'फ़ैसले के लिए हमें यह भी चाहिए:' }) + '</b></p><ul class="list-plain">' +
        miss.map(function (m) { return '<li>' + KK.bi(DOC[m]) + '</li>'; }).join('') + '</ul><p><a class="btn btn-primary" href="followup.html?case=' + encodeURIComponent(caseId) + '">' +
        KK.bi({ en: 'Add documents now', hi: 'अभी दस्तावेज़ जोड़ें' }) + '</a></p></div>' : '') +
      '<div class="notice red" style="margin-top:14px"><p>' + KK.bi({ en: '<b>We never ask for any fee, OTP or bank password.</b> If someone claims to be us and asks you for money, it is a scam.', hi: '<b>हम कभी कोई फ़ीस, OTP या बैंक पासवर्ड नहीं माँगते।</b> अगर कोई हमारा नाम लेकर आपसे पैसे माँगे, तो वह धोखा है।' }).replace(/&lt;(\/?)b&gt;/g, '<$1b>') + '</p></div>' +
      '<p class="center" style="margin-top:16px"><a href="track.html?case=' + encodeURIComponent(caseId) + '">' + KK.bi({ en: 'Check status later', hi: 'बाद में स्थिति देखें' }) + '</a></p>';
  };

  KK.fieldLabel = function (name) {
    var all = [];
    KK.APPLY_STEPS.forEach(function (s) { s.fields.forEach(function (f) { all.push(f); }); });
    KK.CONSENT_FIELDS.forEach(function (f) { all.push(f); });
    var f = all.filter(function (x) { return x.name === name; })[0];
    return f ? KK.t(f.label) : name;
  };

  /** Shared submit pipeline for apply + emergency. */
  KK.submitCase = function (lane, data, files, ui, meta, formId) {
    var pendingKey = 'kk_pending_' + formId;
    ui.progress(4, { en: 'Sending your request…', hi: 'आपका अनुरोध भेजा जा रहा है…' });
    return KK.api('submit', { lane: lane, form: KK.toServerForm(data, lane), hp: meta.hp, elapsedMs: meta.elapsedMs }, { retries: 1, timeout: 60000 }).then(function (r) {
      if (!r || !r.ok) {
        var code = (r && r.error) || 'server_error';
        if (code === 'invalid') return ui.fail(KK.errorText('invalid') + ' ' + (r.fields || []).map(KK.fieldLabel).join(', '), true);
        if (code === 'paused') return ui.fail(KK.errorText('paused') + (r.reopen ? ' ' + KK.t({ en: 'Reopening ', hi: 'फिर खुलेगा: ' }) + KK.niceDate(r.reopen, KK.lang()) + '.' : ''), false);
        return ui.fail(KK.errorText(code), code === 'too_fast');
      }
      var pending = { caseId: r.caseId, token: r.token, uploaded: [], at: Date.now(), lane: lane };
      var savePending = function () { try { localStorage.setItem(pendingKey, JSON.stringify(pending)); } catch (e) { /* ignore */ } };
      savePending();
      return KK.uploadAll(r.caseId, r.token, files, function (i, n) {
        ui.progress(10 + 80 * i / Math.max(1, n), { en: 'Uploading file ' + (i + 1) + ' of ' + n + '…', hi: 'फ़ाइल ' + (i + 1) + '/' + n + ' अपलोड हो रही है…' });
      }, function (x) { pending.uploaded.push(x.item.key); savePending(); }).then(function (failed) {
        ui.progress(94, { en: 'Finishing…', hi: 'पूरा हो रहा है…' });
        return KK.api('finalize', { caseId: r.caseId, token: r.token, uploadErrors: failed }, { retries: 2, timeout: 60000 }).then(function (fin) {
          try { localStorage.removeItem(pendingKey); } catch (e) { /* ignore */ }
          ui.done(KK.successHtml(r.caseId, fin && fin.missing, failed, lane === 'Emergency'));
        });
      });
    });
  };

  /** If a previous submission was interrupted, finish uploading the remaining files. */
  KK.resumePending = function (formId, el) {
    var pendingKey = 'kk_pending_' + formId, pending;
    try { pending = JSON.parse(localStorage.getItem(pendingKey) || 'null'); } catch (e) { pending = null; }
    if (!pending || Date.now() - pending.at > 5.5 * 3600000) { try { localStorage.removeItem(pendingKey); } catch (e) { /* ignore */ } return Promise.resolve(false); }
    el.innerHTML = '<div class="notice teal"><p>' + KK.bi({ en: 'Your request ' + pending.caseId + ' was sent, but some files may not have finished uploading.', hi: 'आपका अनुरोध ' + pending.caseId + ' भेजा जा चुका है, पर कुछ फ़ाइलें शायद पूरी अपलोड नहीं हुईं।' }) +
      '</p><button class="btn btn-primary" id="resume">' + KK.bi({ en: 'Finish sending', hi: 'भेजना पूरा करें' }) + '</button></div>';
    return new Promise(function (resolve) {
      document.getElementById('resume').onclick = function () {
        KK.fileStore.all(formId + ':').then(function (list) {
          var files = list.filter(function (x) { return pending.uploaded.indexOf(x.key) < 0; })
            .map(function (x) { return { kind: x.rec.meta.kind, item: Object.assign({ key: x.key, blob: x.rec.blob }, x.rec.meta) }; });
          el.innerHTML = '<div class="sending"><h2>' + KK.bi({ en: 'Uploading…', hi: 'अपलोड हो रहा है…' }) + '</h2></div>';
          return KK.uploadAll(pending.caseId, pending.token, files, function () {}, function () {}).then(function (failed) {
            return KK.api('finalize', { caseId: pending.caseId, token: pending.token, uploadErrors: failed }, { retries: 2 }).then(function (fin) {
              try { localStorage.removeItem(pendingKey); localStorage.removeItem('kk_draft_' + formId); } catch (e) { /* ignore */ }
              KK.fileStore.clear(formId + ':');
              el.innerHTML = KK.successHtml(pending.caseId, fin && fin.missing, failed, pending.lane === 'Emergency');
              resolve(true);
            });
          });
        }).catch(function () {
          el.innerHTML = '<div class="notice red"><p>' + KK.esc(KK.errorText('offline')) + '</p><p>' + KK.bi({ en: 'Your Case ID is ', hi: 'आपका केस ID है ' }) + '<b>' + KK.esc(pending.caseId) +
            '</b>. ' + KK.bi({ en: 'You can add files later on the follow-up page.', hi: 'आप बाद में फ़ॉलो-अप पेज पर फ़ाइलें जोड़ सकते हैं।' }) + '</p></div>';
          resolve(true);
        });
      };
    });
  };

  /* ---------- page boot ---------- */
  KK.bootApply = function () {
    var el = document.getElementById('apply-form');
    if (!el) return;
    KK.resumePending('apply', el).then(function (resumed) {
      if (resumed) return;
      var start = function (limits) {
        new KK.Form({ el: el, id: 'apply', funnel: 'apply', steps: KK.APPLY_STEPS, reviewFields: KK.CONSENT_FIELDS, limits: limits,
          submitLabel: { en: 'Submit request', hi: 'अनुरोध जमा करें' },
          onSubmit: function (data, files, ui, meta) { return KK.submitCase('Standard', data, files, ui, meta, 'apply'); } });
      };
      if (!KK.apiReady()) { start(); return; }
      KK.config().then(function (c) {
        if (c && c.intake === 'paused' && !KK.testKey) {
          var p = document.getElementById('paused');
          if (p) {
            p.classList.remove('hidden');
            var r = p.querySelector('[data-reopen]');
            if (r && c.reopen) r.innerHTML = KK.bi({ en: 'Applications reopen on ' + KK.niceDate(c.reopen, 'en') + '.', hi: 'आवेदन ' + KK.niceDate(c.reopen, 'hi') + ' से फिर खुलेंगे।' });
          }
          el.classList.add('hidden');
          return;
        }
        start(c && c.limits);
      }).catch(function () { start(); });
    });
  };
})();
