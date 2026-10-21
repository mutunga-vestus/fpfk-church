export const adminSchema = {
  home: {
    label: 'Home',
    fields: [
      { key: 'heroImage', label: 'Hero Background Photo', type: 'image' },
      { key: 'heroTitle', label: 'Hero Title', type: 'textarea', locked: true },
      { key: 'heroSubtitle', label: 'Hero Subtitle', type: 'text', locked: true },
      { key: 'ctaPrimary', label: 'Primary Button Text', type: 'text', locked: true },
      { key: 'ctaSecondary', label: 'Secondary Button Text', type: 'text', locked: true },
      {
        key: 'features',
        label: 'Bible Verses / Text Cards (max 10)',
        type: 'features',
        itemFields: [
          { key: 'text', label: 'Verse / Text' },
          { key: 'reference', label: 'Reference (optional)' },
          { key: 'announcement', label: 'Announcement bar text (leave empty to hide)', type: 'text' },
          { key: 'announcementLink', label: 'Announcement link (optional, e.g. /events)', type: 'text' },
       ],
      },
      {
        key: 'posters', label: 'Posters (homepage cards, max 2)', type: 'posters',
        itemFields: [
          { key: 'image', label: 'Poster Image' },
          { key: 'title', label: 'Caption (optional)' },
        ],
      },
      { key: 'supportPosts', label: 'Support Needs (homepage cards linking to Give, max 4)', type: 'support' },
      { key: 'notice', label: 'Announcement (shows below Ministries, expires automatically)', type: 'notice' },
    ],
  },
  about: {
    label: 'About Us',
    fields: [
      { key: 'heroImage', label: 'Background Photo', type: 'image' },
      { key: 'title', label: 'Title', type: 'text', locked: true },
      { key: 'subtitle', label: 'Subtitle', type: 'text', locked: true },
      { key: 'story', label: 'Our Story', type: 'textarea', locked: true },
      { key: 'beliefs', label: 'What We Believe', type: 'textarea', locked: true },
      {
        key: 'leaders',
        label: 'Leaders (photo + name + role + bio)',
        type: 'leaders',
        itemFields: [
          { key: 'image', label: 'Photo' },
          { key: 'name', label: 'Name' },
          { key: 'role', label: 'Role' },
          { key: 'bio', label: 'Bio' },
        ],
      },
    ],
    
  },
  ministries: {
    label: 'Ministries',
    fields: [
      { key: 'title', label: 'Title', type: 'text', locked: true },
      { key: 'subtitle', label: 'Subtitle', type: 'text', locked: true },
      {
        key: 'items', label: 'Ministries', type: 'ministries',
        itemFields: [
          { key: 'image', label: 'Photo (optional)' },
          { key: 'title', label: 'Title' },
          { key: 'desc', label: 'Description' },
        ],
      },
    ],
  },
  sermons: {
    label: 'Sermons',
    fields: [
      { key: 'title', label: 'Title', type: 'text', locked: true },
      {
        key: 'items', label: 'Sermons', type: 'list',
        itemFields: [
          { key: 'series', label: 'Series Label' },
          { key: 'title', label: 'Sermon Title' },
          { key: 'speaker', label: 'Speaker' },
          { key: 'date', label: 'Date' },
          { key: 'duration', label: 'Duration' },
          { key: 'videoUrl', label: 'Video Link (YouTube URL)' },
        ],
      },
    ],
  },
  events: {
    label: 'Events',
    fields: [
      { key: 'title', label: 'Title', type: 'text', locked: true },
      { key: 'subtitle', label: 'Subtitle', type: 'text', locked: true },
      {
        key: 'items', label: 'Events', type: 'events',
        itemFields: [
          { key: 'image', label: 'Flyer/Photo (optional)' },
          { key: 'date', label: 'Date/Time' },
          { key: 'title', label: 'Event Title' },
          { key: 'desc', label: 'Description' },
          { key: 'buttonLabel', label: 'Button Text' },
        ],
      },
    ],
  },
  connect: {
    label: 'Connect',
    fields: [
      { key: 'title', label: 'Title', type: 'text', locked: true },
      { key: 'subtitle', label: 'Subtitle', type: 'text', locked: true },
    ],
  },
  give: {
    label: 'Give',
    fields: [
      { key: 'title', label: 'Title', type: 'text', locked: true },
      { key: 'subtitle', label: 'Subtitle', type: 'text', locked: true },
      { key: 'note', label: 'Footer Note', type: 'text', locked: true },
      {
        key: 'givingTypes', label: 'Giving Types (dropdown options)', type: 'list',
        itemFields: [
          { key: 'label', label: 'Giving Type (e.g. Tithe, Offering, Sacrifice)' },
        ],
      },
      { key: 'mpesaPaybill', label: 'M-Pesa Paybill Number', type: 'text' },
      { key: 'mpesaAccountNumber', label: 'M-Pesa Account Number Instructions', type: 'text' },
      { key: 'bankName', label: 'Bank Name', type: 'text' },
      { key: 'bankAccountName', label: 'Bank Account Name', type: 'text' },
      { key: 'bankAccountNumber', label: 'Bank Account Number', type: 'text' },
      { key: 'bankBranch', label: 'Bank Branch', type: 'text' },
      { key: 'bankSwift', label: 'Bank SWIFT/Code (optional)', type: 'text' },
    ],
  },
};