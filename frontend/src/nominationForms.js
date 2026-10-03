// Field definitions mirror the official MCCIA application forms on mcciapune.com/awards/.
// Field types: text, email, tel, number, date, textarea, select, radio, table.

const t = (key, label, opts = {}) => ({ key, label, type: 'text', ...opts });
const area = (key, label, opts = {}) => ({ key, label, type: 'textarea', full: true, rows: 3, ...opts });
const radio = (key, label, options, opts = {}) => ({ key, label, type: 'radio', options, full: true, ...opts });
const table = (key, label, valueLabel, rows, opts = {}) => ({ key, label, type: 'table', valueLabel, rows, full: true, ...opts });

const YEARS = ['2023-24', '2024-25', '2025-26'];
const email = (opts = {}) => ({ key: 'email', label: 'Email to send acknowledgement', type: 'email', required: true, autoComplete: 'email', ...opts });
const mobile = (opts = {}) => ({ key: 'mobile', label: 'Mobile number', type: 'tel', autoComplete: 'tel', placeholder: '+91 98765 43210', ...opts });
const landline = () => ({ key: 'landline', label: 'Landline number', type: 'tel' });
const fax = () => t('fax', 'Fax number');
const address = () => t('address', 'Company address', { required: true, full: true, autoComplete: 'street-address' });
const city = () => t('city', 'City', { required: true, autoComplete: 'address-level2' });
const pincode = (required = true) => ({ key: 'pincode', label: 'Pincode', type: 'text', required, inputMode: 'numeric', maxLength: 6, pattern: /^\d{6}$/, patternMessage: 'Enter a 6-digit pincode' });
const geo = (required = true) => t('geo', "Geo location (paste your company's Google Maps link)", { required, full: true });
const chief = () => [t('chiefName', 'Name of Chief of the Organisation (optional)'), t('chiefDesignation', 'Designation of Chief of the Organisation (optional)')];
const turnoverProfit = (required = false) => [
  table('turnover', 'Turnover (sales) for the last three years', 'Turnover (₹)', YEARS, { required }),
  table('profit', 'Profit for the last three years', 'Profit (₹)', YEARS, { required }),
];

const LEGAL_STATUS = ['Proprietary', 'Partnership', 'Private Limited', 'Public Limited', 'LLP', 'Other'];

const parkheRamabai = {
  step2: [
    {
      title: 'Organisation & contact',
      sub: 'Company details and primary contact information',
      fields: [
        t('companyName', 'Company name (in capital letters)', { required: true, upper: true, autoComplete: 'organization' }),
        { key: 'legalStatus', label: 'Legal status', type: 'select', required: true, options: LEGAL_STATUS },
        t('contactPerson', 'Contact person (in capital letters)', { upper: true, autoComplete: 'name' }),
        t('designation', 'Designation (in capital letters)', { upper: true }),
        address(),
        t('yearEstablished', 'Year of establishment', { required: true, inputMode: 'numeric', maxLength: 4, pattern: /^(18|19|20)\d{2}$/, patternMessage: 'Enter a 4-digit year' }),
        t('state', 'State', { required: true, autoComplete: 'address-level1' }),
        city(),
        pincode(),
        geo(),
        email(),
        mobile(),
        landline(),
        { key: 'website', label: 'Website', type: 'text', required: true, placeholder: 'www.example.com' },
      ],
    },
  ],
  step3: [
    {
      title: 'Nomination details',
      sub: 'Product, process and business performance details',
      fields: [
        t('productName', 'Name of the product / process / services tendered for the award', { full: true }),
        t('certification', 'Certification (ISO / quality)', { required: true, full: true }),
        area('description', 'Brief description of the product / process to be considered for the award', { rows: 4 }),
        area('specialFeatures', 'Special features / advantages of the product or services'),
        t('launchedSince', 'Is the product commercially launched and marketed? If yes, since when', { type: 'date', full: true }),
        ...turnoverProfit(),
      ],
    },
  ],
  file: true,
};

const forms = {
  'gs-parkhe': parkheRamabai,
  'ramabai-joshi': parkheRamabai,

  'rj-rathi': {
    step2: [
      {
        title: 'Organisation & contact',
        sub: 'Company details and primary contact information',
        fields: [
          t('companyName', 'Name of the company (in capital letters)', { required: true, upper: true, autoComplete: 'organization' }),
          t('contactPerson', 'Name of the concerned person (in capital letters)', { required: true, upper: true, autoComplete: 'name' }),
          email(), mobile(), landline(), fax(),
        ],
      },
      { title: 'Address & location', sub: 'Registered company address and geo location', fields: [address(), city(), pincode(), geo()] },
      {
        title: 'Organisation profile',
        sub: 'Establishment year and leadership details',
        fields: [
          t('yearEstablished', 'Year of establishment', { required: true, inputMode: 'numeric', maxLength: 4, pattern: /^(18|19|20)\d{2}$/, patternMessage: 'Enter a 4-digit year' }),
          ...chief(),
        ],
      },
    ],
    step3: [
      {
        title: 'Green initiative nomination',
        sub: 'Describe your environmental contributions and supporting evidence',
        fields: [area('description', 'Brief description of the green initiatives undertaken by the company, including any activity that has helped to reduce pollution, contribute towards a green environment, or protect and promote a green environment, including initiatives to reduce global warming. Please provide maximum information and data to establish your claims.', { required: true, rows: 8 })],
      },
    ],
    file: true,
  },

  'bg-deshmukh': {
    step2: [
      {
        title: 'Organisation & contact',
        fields: [
          t('companyName', 'Company name', { required: true, autoComplete: 'organization' }),
          t('contactPerson', 'Contact person', { required: true, autoComplete: 'name' }),
          email({ label: 'Email address' }), mobile({ required: true }), address(), city(), pincode(false),
        ],
      },
    ],
    step3: [
      {
        title: 'CSR initiatives',
        sub: 'Activity in education, health and hygiene, environment, safety, energy, water, waste management or any social field',
        fields: [area('description', 'Describe your CSR activities and their impact', { required: true, rows: 6 })],
      },
    ],
    file: true,
  },

  'kiran-natu': {
    step2: [
      {
        title: 'Entrepreneur & contact',
        fields: [
          t('contactPerson', 'Name', { required: true, autoComplete: 'name' }),
          radio('firstGen', 'Are you a first-generation entrepreneur?', ['Yes', 'No']),
          t('companyName', 'Company name', { required: true, autoComplete: 'organization' }),
          t('commencement', 'Date of commencement', { type: 'date' }),
          t('startingCapital', 'Starting capital (₹)', { type: 'number', inputMode: 'numeric' }),
          email(), landline(), fax(), mobile(),
        ],
      },
      { title: 'Address & location', fields: [address(), city(), pincode(), geo(false)] },
    ],
    step3: [
      {
        title: 'Business profile',
        fields: [
          t('msmeNumber', 'MSME registration number'),
          t('msmeDate', 'MSME registration date', { type: 'date' }),
          radio('legalStatus', 'Legal status', LEGAL_STATUS, { required: true }),
          t('employees', 'Number of employees', { type: 'number', inputMode: 'numeric' }),
          t('productName', 'Name of the product / process / services tendered for the award', { required: true, full: true }),
          area('description', 'Brief description (100 words)', { rows: 4, maxWords: 100 }),
          area('locations', 'List of locations (business / manufacturing units)'),
          t('grossBlock', 'Gross block investment (₹)', { type: 'number', inputMode: 'numeric' }),
          t('plantMachinery', 'Plant & machinery investment (₹)', { type: 'number', inputMode: 'numeric' }),
          t('netBlock', 'Net block investment (₹)', { type: 'number', inputMode: 'numeric' }),
        ],
      },
      {
        title: 'Financials & recognition',
        fields: [
          ...turnoverProfit(),
          radio('patent', 'Patent registered?', ['Yes', 'No']),
          t('awardsRecognition', 'Awards / recognition', { full: true }),
          area('certifications', 'List of certifications (ISO / standards)'),
          area('writeup', 'Write-up about yourself / the company and why you should be considered for the award', { rows: 5 }),
        ],
      },
    ],
    file: true,
  },

  ghorpade: {
    step2: [
      {
        title: 'Organisation & contact',
        fields: [
          t('companyName', 'Company name', { required: true, autoComplete: 'organization' }),
          t('contactPerson', 'Contact person', { autoComplete: 'name' }),
          email(), mobile(), landline(), fax(),
        ],
      },
      { title: 'Address & location', fields: [address(), city(), pincode(false), geo(false)] },
      {
        title: 'Organisation profile',
        fields: [
          t('yearEstablished', 'Year of establishment', { required: true, inputMode: 'numeric', maxLength: 4, pattern: /^(18|19|20)\d{2}$/, patternMessage: 'Enter a 4-digit year' }),
          ...chief(),
        ],
      },
    ],
    step3: [
      {
        title: 'Nomination details',
        fields: [
          t('productName', 'Name of the product / process / services tendered for the award', { full: true }),
          area('description', 'Brief description', { rows: 4 }),
          area('specialFeatures', 'Special features / advantages'),
          t('defenceApproval', 'Defence organisation approval (if yes, since when)', { type: 'date' }),
          t('firstManufacturing', 'First manufacturing date & supply duration', { type: 'date' }),
          ...turnoverProfit(),
        ],
      },
    ],
    file: true,
  },

  'bg-chitale': {
    step2: [
      {
        title: 'Organisation & founder',
        fields: [
          t('companyName', 'Company name (in capital letters)', { required: true, upper: true, autoComplete: 'organization' }),
          t('founderName', 'Founder name (in capital letters)', { required: true, upper: true }),
          email({ label: 'Email', autoComplete: 'email' }),
          t('telephone', 'Telephone number', { type: 'tel' }),
          fax(),
        ],
      },
      { title: 'Address', fields: [address(), city(), { ...pincode(), key: 'pincode', label: 'Pin code' }] },
      {
        title: 'Business profile',
        fields: [
          t('yearEstablished', 'Year of establishment', { required: true, inputMode: 'numeric', maxLength: 4, pattern: /^(18|19|20)\d{2}$/, patternMessage: 'Enter a 4-digit year' }),
          t('yearsInBusiness', 'Number of years in business', { type: 'number', inputMode: 'numeric' }),
          radio('generations', 'Generations involved', ['1', '2', '3 & more'], { required: true }),
          t('chiefName', 'Chief of the organisation: name'),
          t('chiefDesignation', 'Chief of the organisation: designation'),
        ],
      },
    ],
    step3: [
      {
        title: 'Nomination details',
        fields: [
          t('productName', 'Product / process / services name', { required: true, full: true }),
          area('description', 'Brief description', { rows: 4 }),
          area('specialFeatures', 'Special features / advantages'),
          t('firstDate', 'First manufacturing / service date', { type: 'date' }),
          t('launchStatus', 'Commercial launch status & date'),
          ...turnoverProfit(true),
        ],
      },
    ],
    file: true,
  },

  'kirloskar-export': {
    step2: [
      {
        title: 'Organisation & contact',
        fields: [
          t('companyName', 'Full name of the company / organisation', { required: true, autoComplete: 'organization' }),
          t('contactPerson', "Contact person's name", { required: true, autoComplete: 'name' }),
          email({ label: "Contact person's email", autoComplete: 'email' }),
          t('industryType', 'Type of industry', { required: true }),
          t('designation', "Contact person's designation (Chief of the organisation)", { required: true }),
          mobile({ label: "Contact person's phone number", required: true }),
        ],
      },
      { title: 'Address', fields: [address()] },
    ],
    step3: [
      {
        title: 'Export performance',
        sub: 'Based on export value for FY 2024-25, with the previous two years considered',
        fields: [
          t('productsManufactured', 'Products manufactured', { required: true, full: true }),
          t('productsExported', 'Products exported', { required: true, full: true }),
          t('topCountries', "Top 5 countries of your company's exports", { required: true, full: true }),
          t('turnoverFY', 'Turnover of FY 2025-26 (₹)', { required: true, type: 'number', inputMode: 'numeric' }),
          t('exports2526', 'Exports in ₹ (2025-26)', { required: true, type: 'number', inputMode: 'numeric' }),
          t('exports2425', 'Exports in ₹ (2024-25)', { required: true, type: 'number', inputMode: 'numeric' }),
          t('exports2324', 'Exports in ₹ (2023-24)', { required: true, type: 'number', inputMode: 'numeric' }),
          area('exportAwards', 'Details of national / international awards for export performance', { required: true }),
          area('additional', 'Additional information about your company and exports (optional)', { rows: 4 }),
        ],
      },
    ],
    file: false,
  },

  'sustainability-mccia': {
    step2: [
      {
        title: 'Organisation & contact',
        fields: [
          t('companyName', 'Full name of the company / organisation', { required: true, autoComplete: 'organization' }),
          t('contactPerson', "Contact person's name", { required: true, autoComplete: 'name' }),
          t('employeeStrength', 'Employee strength', { required: true, type: 'number', inputMode: 'numeric' }),
          email({ label: "Contact person's email", autoComplete: 'email' }),
          mobile({ label: "Contact person's phone number", required: true }),
        ],
      },
    ],
    step3: [
      {
        title: 'Sustainability practices',
        sub: 'Tell us how your organisation manages each waste stream',
        fields: [
          area('wetWaste', 'Wet waste management', { rows: 2 }),
          area('paperWaste', 'Paper waste management', { rows: 2 }),
          area('plasticWaste', 'Plastic waste management', { rows: 2 }),
          area('metalWaste', 'Metal waste management', { rows: 2 }),
          area('eWaste', 'E-waste management', { rows: 2 }),
          area('glassWaste', 'Glass waste management', { rows: 2 }),
          area('cdWaste', 'C&D waste management', { rows: 2 }),
          area('sanitaryWaste', 'Sanitary waste management', { rows: 2 }),
          area('liquidWaste', 'Liquid waste management', { rows: 2 }),
          area('innovations', 'What innovative ideas have you implemented for waste management?', { required: true, rows: 4 }),
          area('wishlist', 'What is your wishlist of ideas for waste management?', { rows: 3 }),
          area('encourage', 'How are you encouraging employees to develop sustainable products / technologies?', { rows: 3 }),
        ],
      },
    ],
    file: false,
  },
};

export const nominationFormFor = awardId => forms[awardId] || forms['bg-deshmukh'];
