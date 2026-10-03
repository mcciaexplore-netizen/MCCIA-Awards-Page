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
const address = (opts = {}) => t('address', 'Company address', { required: true, full: true, autoComplete: 'street-address', ...opts });
const city = () => t('city', 'City', { required: true, autoComplete: 'address-level2' });
const pincode = (required = true) => ({ key: 'pincode', label: 'Pincode', type: 'text', required, inputMode: 'numeric', maxLength: 6, pattern: /^\d{6}$/, patternMessage: 'Enter a 6-digit pincode' });
const geo = (required = true) => t('geo', "Geo location (paste your company's Google Maps link)", { required, full: true });
const chief = () => [t('chiefName', 'Name of Chief of the Organisation (optional)'), t('chiefDesignation', 'Designation of Chief of the Organisation (optional)')];
const turnoverProfit = (required = false) => [
  table('turnover', 'Turnover (sales) for the last three years', 'Turnover (₹)', YEARS, { required }),
  table('profit', 'Profit for the last three years', 'Profit (₹)', YEARS, { required }),
];

const LEGAL_STATUS = ['Proprietary', 'Partnership', 'Private Limited', 'Public Limited', 'LLP', 'Other'];

const shared = {
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

const withDetails = (base, subtitle, overrides) => ({
  ...base,
  subtitle,
  step3: base.step3.map(group => ({
    ...group,
    ...(overrides.group || {}),
    fields: group.fields.map(field => ({ ...field, ...(overrides.fields?.[field.key] || {}) })),
  })),
});

const forms = {
  'gs-parkhe': withDetails(shared, 'Innovation in Entrepreneurship · Shared application with the Ramabai Joshi Award', {
    group: { title: 'Innovation details', sub: 'The innovative product, process, design, service or import-substitute item, and its business performance' },
    fields: {
      productName: { label: 'Name of the innovative product / process / design / service tendered for the award' },
      description: { label: 'Brief description of the innovation and the problem it solves', hint: 'Mention market relevance and acceptance, and any import substitution.' },
      specialFeatures: { label: 'What makes this innovation different? Special features / advantages' },
    },
  }),
  'ramabai-joshi': withDetails(shared, 'Women Entrepreneurs · Shared application with the G. S. Parkhe Award', {
    group: { title: "Women entrepreneur's innovation", sub: 'Products, appliances or solutions useful for domestic purposes, including sustainable technologies' },
    fields: {
      productName: { label: 'Name of the product / appliance / solution tendered for the award' },
      description: { label: 'Brief description of the product and how it is useful for domestic use', hint: 'Mention the sustainability benefit and the practical impact for users.' },
      specialFeatures: { label: 'Special features / advantages of the product' },
    },
  }),

  'rj-rathi': {
    subtitle: 'Green Initiative Application',
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
    subtitle: 'Corporate Social Responsibility (CSR) Application',
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
      { title: 'Address & location', sub: 'Registered company address', fields: [address(), city(), pincode(), geo(false)] },
      {
        title: 'Organisation profile',
        sub: 'Scale and leadership details',
        fields: [
          t('yearEstablished', 'Year of establishment', { required: true, inputMode: 'numeric', maxLength: 4, pattern: /^(18|19|20)\d{2}$/, patternMessage: 'Enter a 4-digit year' }),
          { key: 'scale', label: 'Scale of enterprise', type: 'select', required: true, options: ['Small', 'Medium', 'Large'] },
          ...chief(),
        ],
      },
    ],
    step3: [
      {
        title: 'CSR initiatives',
        sub: 'Small, medium and large-scale enterprises with CSR activity in any social field',
        fields: [
          { key: 'csrArea', label: 'Main area of CSR activity', type: 'select', required: true, full: true, options: ['Handicapped / differently abled', 'Education', 'Health and hygiene', 'Environment', 'Safety', 'Conservation of energy', 'Water', 'Waste management', 'Other social field'] },
          t('csrSince', 'CSR activity running since (year)', { inputMode: 'numeric', maxLength: 4, pattern: /^(19|20)\d{2}$/, patternMessage: 'Enter a 4-digit year' }),
          t('csrSpend', 'CSR spend in the last financial year (₹)', { type: 'number', inputMode: 'numeric' }),
          t('beneficiaries', 'Number of beneficiaries reached', { type: 'number', inputMode: 'numeric' }),
          t('csrLocations', 'Locations / communities served'),
          area('description', 'Describe your CSR initiatives and how they contribute to social development and community empowerment', { required: true, rows: 6 }),
          area('impact', 'Measurable impact and results (data, testimonials, partners)', { rows: 4 }),
        ],
      },
    ],
    file: true,
  },

  'kiran-natu': {
    subtitle: 'First Generation Entrepreneur Application',
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
    subtitle: 'MSME Defence Production Application',
    step2: [
      {
        title: 'Organisation & contact',
        sub: 'Company details and primary contact information',
        fields: [
          t('companyName', 'Company name', { required: true, autoComplete: 'organization' }),
          email(),
          landline(),
          t('contactPerson', 'Contact person', { autoComplete: 'name' }),
          fax(),
          mobile(),
        ],
      },
      { title: 'Address & location', sub: 'Registered company address and geo location', fields: [address({ label: 'Address' }), city(), pincode(false), geo(false)] },
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
        title: 'Nomination details',
        sub: 'Product details, defence supply history and financials',
        fields: [
          t('productName', 'Name of the product / process / services tendered for the award', { full: true }),
          area('description', 'Brief description of the product / process to be considered for the award', { rows: 4 }),
          area('specialFeatures', 'Special features / advantages of the product or services'),
          t('defenceApproval', 'Is the product approved by a Defence organisation? If yes, since when', { type: 'date', full: true }),
          t('firstManufacturing', 'The first date the product was manufactured and number of years supplying to Defence (area / region)', { type: 'date', full: true }),
          ...turnoverProfit(),
        ],
      },
    ],
    file: true,
  },

  'bg-chitale': {
    subtitle: 'Agri-based or Dairy / Food processing business unit',
    step2: [
      {
        title: 'Organisation & founder',
        sub: 'Company and founder details',
        fields: [
          t('companyName', 'Name of the company (in capital letters)', { required: true, upper: true, autoComplete: 'organization' }),
          t('founderName', 'Name of founder (in capital letters)', { required: true, upper: true }),
        ],
      },
      {
        title: 'Address & contact',
        sub: 'Registered address and contact details',
        fields: [
          address({ label: 'Address' }),
          city(),
          { ...pincode(), label: 'Pin' },
          t('telephone', 'Telephone no.', { type: 'tel' }),
          fax(),
          email({ label: 'Email', autoComplete: 'email' }),
        ],
      },
      {
        title: 'Business profile',
        sub: 'Years, generations and leadership',
        fields: [
          t('yearEstablished', 'Year of establishment', { required: true, inputMode: 'numeric', maxLength: 4, pattern: /^(18|19|20)\d{2}$/, patternMessage: 'Enter a 4-digit year' }),
          t('yearsInBusiness', 'Number of years in the business', { type: 'number', inputMode: 'numeric' }),
          radio('generations', 'Generations involved in the business', ['1', '2', '3 & more'], { required: true }),
          t('chiefName', 'Name of Chief of the Organisation'),
          t('chiefDesignation', 'Designation of Chief of the Organisation'),
        ],
      },
    ],
    step3: [
      {
        title: 'Nomination details',
        sub: 'Product, process and launch details',
        fields: [
          t('productName', 'Name of the product / process / services tendered for the award', { required: true, full: true }),
          area('description', 'Brief description of the product / process to be considered for the award', { rows: 4 }),
          area('specialFeatures', 'Special features / advantages of the product or services'),
          t('firstDate', 'The first date the product was manufactured / the services were rendered', { type: 'date' }),
          t('launchedSince', 'Is the product commercially launched and marketed? If yes, since when', { type: 'date' }),
        ],
      },
      {
        title: 'Financials',
        sub: 'Turnover and profit for the last three years',
        fields: turnoverProfit(),
      },
    ],
    file: false,
  },

  'kirloskar-export': {
    subtitle: 'Export Excellence Application 2024-2025',
    step2: [
      {
        title: 'Organisation & contact',
        sub: 'Company details and primary contact information',
        fields: [
          t('companyName', 'Full name of the company / organisation', { required: true, autoComplete: 'organization' }),
          t('contactPerson', "Contact person's name", { required: true, autoComplete: 'name' }),
          email({ label: "Contact person's email", autoComplete: 'email' }),
          t('industryType', 'Type of industry', { required: true }),
          t('designation', "Contact person's designation (Chief of the organisation)", { required: true }),
          mobile({ label: "Contact person's phone number", required: true }),
        ],
      },
      { title: 'Address', sub: 'Company location details', fields: [address({ label: 'Address of the company' })] },
    ],
    step3: [
      {
        title: 'Export performance',
        sub: 'Products, markets, turnover and export details',
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
    subtitle: 'Sustainability Application 2024-25 · Instituted by KPIT Technologies Ltd',
    step2: [
      {
        title: 'Organisation & contact',
        sub: 'Company details and primary contact information',
        fields: [
          t('companyName', 'Full name of the company / organisation', { required: true, full: true, autoComplete: 'organization' }),
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
        sub: 'Waste management and sustainable product initiatives. What steps do you take to manage the following types of waste? Please fill in your responses based on how you manage the different categories of waste generated in your company.',
        fields: [
          area('wetWaste', 'Wet waste', { rows: 2, hint: 'E.g. food waste, broken wood furniture, garden waste' }),
          area('paperWaste', 'Paper waste', { rows: 2, hint: 'E.g. envelopes, documents, magazines, calendars, books, diaries, paper plates, packaging' }),
          area('plasticWaste', 'Plastic waste', { rows: 2, hint: 'E.g. office ID card cases, plastic taps and fixtures' }),
          area('metalWaste', 'Metal waste', { rows: 2, hint: 'E.g. taps and other fixtures, furniture' }),
          area('eWaste', 'E-waste', { rows: 2, hint: 'E.g. batteries, electric wires, cables, switch boards, bulbs' }),
          area('glassWaste', 'Glass waste', { rows: 2 }),
          area('cdWaste', 'C&D waste', { rows: 2, hint: 'E.g. tiles (floor, bathroom, basin), commode, bathtub, basin, fence, broken windows and doors, water supply and drainage pipes' }),
          area('sanitaryWaste', 'Sanitary waste', { rows: 2 }),
          area('liquidWaste', 'Liquid waste', { rows: 2, hint: 'E.g. floor, toilet, basin and window cleaners, grey water, black water' }),
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
