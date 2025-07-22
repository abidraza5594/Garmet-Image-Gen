/**
 * Comprehensive garment categorization system for men's clothing
 * Supports hierarchical selection with primary categories, secondary categories, and detail specifications
 */

export interface GarmentDetail {
  id: string;
  label: string;
  description: string;
}

export interface GarmentSubcategory {
  id: string;
  label: string;
  description: string;
  details: GarmentDetail[];
  placeholderText: string;
  cameraFocus: 'upper_body' | 'lower_body' | 'full_body' | 'accessory' | 'feet';
  poseStyle: 'formal' | 'casual' | 'athletic' | 'fashion' | 'static';
}

export interface GarmentCategory {
  id: string;
  label: string;
  description: string;
  subcategories: GarmentSubcategory[];
}

export const GARMENT_CATEGORIES: GarmentCategory[] = [
  {
    id: 'shirts',
    label: 'Shirts',
    description: 'All types of men\'s shirts and tops',
    subcategories: [
      {
        id: 'dress_shirts',
        label: 'Dress Shirts',
        description: 'Formal business and dress shirts',
        cameraFocus: 'upper_body',
        poseStyle: 'formal',
        placeholderText: 'e.g., spread collar, French cuffs, slim fit, cotton poplin',
        details: [
          { id: 'collar_spread', label: 'Spread Collar', description: 'Wide collar spread' },
          { id: 'collar_point', label: 'Point Collar', description: 'Classic pointed collar' },
          { id: 'collar_button_down', label: 'Button-Down Collar', description: 'Collar with buttons' },
          { id: 'cuff_barrel', label: 'Barrel Cuffs', description: 'Standard button cuffs' },
          { id: 'cuff_french', label: 'French Cuffs', description: 'Cufflink-style cuffs' },
          { id: 'fit_slim', label: 'Slim Fit', description: 'Tailored close-fitting cut' },
          { id: 'fit_regular', label: 'Regular Fit', description: 'Standard comfortable fit' },
          { id: 'fit_relaxed', label: 'Relaxed Fit', description: 'Loose comfortable fit' }
        ]
      },
      {
        id: 'casual_shirts',
        label: 'Casual Shirts',
        description: 'Everyday casual button-up shirts',
        cameraFocus: 'upper_body',
        poseStyle: 'casual',
        placeholderText: 'e.g., flannel, chambray, short sleeve, relaxed fit',
        details: [
          { id: 'sleeve_long', label: 'Long Sleeve', description: 'Full-length sleeves' },
          { id: 'sleeve_short', label: 'Short Sleeve', description: 'Short sleeves' },
          { id: 'material_flannel', label: 'Flannel', description: 'Soft brushed cotton' },
          { id: 'material_chambray', label: 'Chambray', description: 'Lightweight denim-like fabric' },
          { id: 'material_linen', label: 'Linen', description: 'Breathable natural fiber' }
        ]
      },
      {
        id: 'polo_shirts',
        label: 'Polo Shirts',
        description: 'Classic polo and golf shirts',
        cameraFocus: 'upper_body',
        poseStyle: 'casual',
        placeholderText: 'e.g., pique cotton, short sleeve, classic fit, three-button placket',
        details: [
          { id: 'placket_2button', label: '2-Button Placket', description: 'Two-button collar opening' },
          { id: 'placket_3button', label: '3-Button Placket', description: 'Three-button collar opening' },
          { id: 'material_pique', label: 'Pique Cotton', description: 'Textured cotton weave' },
          { id: 'material_jersey', label: 'Jersey Cotton', description: 'Smooth cotton knit' }
        ]
      },
      {
        id: 't_shirts',
        label: 'T-Shirts',
        description: 'Casual t-shirts and tees',
        cameraFocus: 'upper_body',
        poseStyle: 'casual',
        placeholderText: 'e.g., crew neck, v-neck, cotton blend, graphic print',
        details: [
          { id: 'neck_crew', label: 'Crew Neck', description: 'Round neckline' },
          { id: 'neck_v', label: 'V-Neck', description: 'V-shaped neckline' },
          { id: 'neck_henley', label: 'Henley', description: 'Buttoned neckline' },
          { id: 'style_plain', label: 'Plain', description: 'Solid color without graphics' },
          { id: 'style_graphic', label: 'Graphic', description: 'With printed design or logo' }
        ]
      },
      {
        id: 'tank_tops',
        label: 'Tank Tops',
        description: 'Sleeveless shirts and tank tops',
        cameraFocus: 'upper_body',
        poseStyle: 'casual',
        placeholderText: 'e.g., A-shirt, muscle tank, ribbed cotton, athletic fit',
        details: [
          { id: 'style_a_shirt', label: 'A-Shirt', description: 'Classic undershirt style' },
          { id: 'style_muscle', label: 'Muscle Tank', description: 'Athletic-style tank' },
          { id: 'material_ribbed', label: 'Ribbed Cotton', description: 'Textured cotton knit' }
        ]
      }
    ]
  },
  {
    id: 'pants',
    label: 'Pants',
    description: 'All types of men\'s pants and bottoms',
    subcategories: [
      {
        id: 'dress_pants',
        label: 'Dress Pants',
        description: 'Formal business and dress trousers',
        cameraFocus: 'full_body',
        poseStyle: 'formal',
        placeholderText: 'e.g., wool blend, flat front, straight leg, cuffed hem',
        details: [
          { id: 'front_flat', label: 'Flat Front', description: 'Smooth front without pleats' },
          { id: 'front_pleated', label: 'Pleated Front', description: 'Front pleats for extra room' },
          { id: 'leg_straight', label: 'Straight Leg', description: 'Consistent width from hip to ankle' },
          { id: 'leg_tapered', label: 'Tapered Leg', description: 'Narrower at the ankle' },
          { id: 'hem_cuffed', label: 'Cuffed Hem', description: 'Folded hem at bottom' },
          { id: 'hem_plain', label: 'Plain Hem', description: 'Straight cut hem' }
        ]
      },
      {
        id: 'jeans',
        label: 'Jeans',
        description: 'Denim jeans in various styles',
        cameraFocus: 'full_body',
        poseStyle: 'casual',
        placeholderText: 'e.g., straight leg, dark wash, mid-rise, 5-pocket style',
        details: [
          { id: 'fit_skinny', label: 'Skinny Fit', description: 'Very close-fitting throughout' },
          { id: 'fit_slim', label: 'Slim Fit', description: 'Close-fitting but comfortable' },
          { id: 'fit_straight', label: 'Straight Fit', description: 'Classic straight cut' },
          { id: 'fit_relaxed', label: 'Relaxed Fit', description: 'Loose comfortable fit' },
          { id: 'wash_dark', label: 'Dark Wash', description: 'Deep indigo or black denim' },
          { id: 'wash_medium', label: 'Medium Wash', description: 'Classic blue denim' },
          { id: 'wash_light', label: 'Light Wash', description: 'Faded or bleached denim' }
        ]
      },
      {
        id: 'chinos',
        label: 'Chinos',
        description: 'Casual cotton twill pants',
        cameraFocus: 'full_body',
        poseStyle: 'casual',
        placeholderText: 'e.g., cotton twill, slim fit, mid-rise, flat front',
        details: [
          { id: 'rise_low', label: 'Low Rise', description: 'Sits below natural waist' },
          { id: 'rise_mid', label: 'Mid Rise', description: 'Sits at natural waist' },
          { id: 'rise_high', label: 'High Rise', description: 'Sits above natural waist' }
        ]
      },
      {
        id: 'shorts',
        label: 'Shorts',
        description: 'Casual and dress shorts',
        cameraFocus: 'lower_body',
        poseStyle: 'casual',
        placeholderText: 'e.g., 7-inch inseam, flat front, cotton twill, casual fit',
        details: [
          { id: 'length_5inch', label: '5" Inseam', description: 'Short length above knee' },
          { id: 'length_7inch', label: '7" Inseam', description: 'Medium length at knee' },
          { id: 'length_9inch', label: '9" Inseam', description: 'Longer length below knee' },
          { id: 'style_cargo', label: 'Cargo Style', description: 'With side pockets' },
          { id: 'style_flat', label: 'Flat Front', description: 'Clean front design' }
        ]
      }
    ]
  },
  {
    id: 'outerwear',
    label: 'Outerwear',
    description: 'Jackets, blazers, and outer garments',
    subcategories: [
      {
        id: 'blazers',
        label: 'Blazers',
        description: 'Sport coats and blazers',
        cameraFocus: 'upper_body',
        poseStyle: 'formal',
        placeholderText: 'e.g., single-breasted, notched lapel, wool blend, two-button',
        details: [
          { id: 'button_single', label: 'Single-Breasted', description: 'One row of buttons' },
          { id: 'button_double', label: 'Double-Breasted', description: 'Two rows of buttons' },
          { id: 'lapel_notched', label: 'Notched Lapel', description: 'Standard lapel style' },
          { id: 'lapel_peak', label: 'Peak Lapel', description: 'Pointed upward lapel' },
          { id: 'buttons_two', label: 'Two-Button', description: 'Two-button closure' },
          { id: 'buttons_three', label: 'Three-Button', description: 'Three-button closure' }
        ]
      },
      {
        id: 'casual_jackets',
        label: 'Casual Jackets',
        description: 'Casual outerwear and light jackets',
        cameraFocus: 'upper_body',
        poseStyle: 'casual',
        placeholderText: 'e.g., bomber jacket, denim jacket, zip-up, relaxed fit',
        details: [
          { id: 'style_bomber', label: 'Bomber', description: 'Classic bomber jacket style' },
          { id: 'style_denim', label: 'Denim', description: 'Denim jacket' },
          { id: 'style_harrington', label: 'Harrington', description: 'Classic British style jacket' },
          { id: 'closure_zip', label: 'Zip Closure', description: 'Zipper front closure' },
          { id: 'closure_button', label: 'Button Closure', description: 'Button front closure' }
        ]
      },
      {
        id: 'sweaters',
        label: 'Sweaters',
        description: 'Knit sweaters and pullovers',
        cameraFocus: 'upper_body',
        poseStyle: 'casual',
        placeholderText: 'e.g., crew neck, wool blend, cable knit, pullover',
        details: [
          { id: 'style_pullover', label: 'Pullover', description: 'Pull-over style sweater' },
          { id: 'style_cardigan', label: 'Cardigan', description: 'Button-front sweater' },
          { id: 'neck_crew', label: 'Crew Neck', description: 'Round neckline' },
          { id: 'neck_v', label: 'V-Neck', description: 'V-shaped neckline' },
          { id: 'knit_cable', label: 'Cable Knit', description: 'Textured cable pattern' },
          { id: 'knit_ribbed', label: 'Ribbed Knit', description: 'Ribbed texture' }
        ]
      }
    ]
  },
  {
    id: 'formal_wear',
    label: 'Formal Wear',
    description: 'Suits, tuxedos, and formal attire',
    subcategories: [
      {
        id: 'suits',
        label: 'Suits',
        description: 'Complete business and formal suits',
        cameraFocus: 'full_body',
        poseStyle: 'formal',
        placeholderText: 'e.g., two-piece, navy wool, slim fit, notched lapel',
        details: [
          { id: 'piece_two', label: 'Two-Piece', description: 'Jacket and trousers' },
          { id: 'piece_three', label: 'Three-Piece', description: 'Jacket, trousers, and vest' },
          { id: 'color_navy', label: 'Navy', description: 'Navy blue color' },
          { id: 'color_charcoal', label: 'Charcoal', description: 'Dark gray color' },
          { id: 'color_black', label: 'Black', description: 'Black formal color' }
        ]
      },
      {
        id: 'tuxedos',
        label: 'Tuxedos',
        description: 'Black-tie formal wear',
        cameraFocus: 'full_body',
        poseStyle: 'formal',
        placeholderText: 'e.g., black wool, satin lapel, bow tie, formal shirt',
        details: [
          { id: 'lapel_satin', label: 'Satin Lapel', description: 'Glossy satin lapel finish' },
          { id: 'lapel_grosgrain', label: 'Grosgrain Lapel', description: 'Ribbed fabric lapel' },
          { id: 'shirt_wing', label: 'Wing Collar Shirt', description: 'Formal wing collar' },
          { id: 'shirt_spread', label: 'Spread Collar Shirt', description: 'Wide collar spread' }
        ]
      }
    ]
  },
  {
    id: 'activewear',
    label: 'Activewear',
    description: 'Athletic and sports clothing',
    subcategories: [
      {
        id: 'athletic_tops',
        label: 'Athletic Tops',
        description: 'Sports shirts and athletic tops',
        cameraFocus: 'upper_body',
        poseStyle: 'athletic',
        placeholderText: 'e.g., moisture-wicking, mesh panels, athletic fit, performance fabric',
        details: [
          { id: 'feature_moisture_wicking', label: 'Moisture-Wicking', description: 'Sweat-wicking technology' },
          { id: 'feature_mesh', label: 'Mesh Panels', description: 'Breathable mesh inserts' },
          { id: 'fit_athletic', label: 'Athletic Fit', description: 'Performance-oriented fit' },
          { id: 'sleeve_sleeveless', label: 'Sleeveless', description: 'Tank top style' }
        ]
      },
      {
        id: 'athletic_bottoms',
        label: 'Athletic Bottoms',
        description: 'Sports shorts and athletic pants',
        cameraFocus: 'lower_body',
        poseStyle: 'athletic',
        placeholderText: 'e.g., running shorts, compression fit, elastic waistband, quick-dry',
        details: [
          { id: 'style_running', label: 'Running Shorts', description: 'Lightweight running shorts' },
          { id: 'style_basketball', label: 'Basketball Shorts', description: 'Longer athletic shorts' },
          { id: 'fit_compression', label: 'Compression Fit', description: 'Tight performance fit' },
          { id: 'feature_quick_dry', label: 'Quick-Dry', description: 'Fast-drying fabric' }
        ]
      }
    ]
  },
  {
    id: 'accessories',
    label: 'Accessories',
    description: 'Ties, belts, watches, and other accessories',
    subcategories: [
      {
        id: 'neckwear',
        label: 'Neckwear',
        description: 'Ties, bow ties, and pocket squares',
        cameraFocus: 'accessory',
        poseStyle: 'formal',
        placeholderText: 'e.g., silk tie, paisley pattern, 3.5-inch width, classic length',
        details: [
          { id: 'type_necktie', label: 'Necktie', description: 'Standard long tie' },
          { id: 'type_bow_tie', label: 'Bow Tie', description: 'Formal bow tie' },
          { id: 'width_skinny', label: 'Skinny (2.5")', description: 'Narrow width tie' },
          { id: 'width_classic', label: 'Classic (3.5")', description: 'Standard width tie' },
          { id: 'width_wide', label: 'Wide (4")', description: 'Wider traditional tie' }
        ]
      },
      {
        id: 'belts',
        label: 'Belts',
        description: 'Dress and casual belts',
        cameraFocus: 'accessory',
        poseStyle: 'static',
        placeholderText: 'e.g., leather dress belt, black, 1.25-inch width, silver buckle',
        details: [
          { id: 'style_dress', label: 'Dress Belt', description: 'Formal leather belt' },
          { id: 'style_casual', label: 'Casual Belt', description: 'Everyday casual belt' },
          { id: 'material_leather', label: 'Leather', description: 'Genuine leather construction' },
          { id: 'material_fabric', label: 'Fabric', description: 'Canvas or fabric material' },
          { id: 'buckle_silver', label: 'Silver Buckle', description: 'Silver-toned hardware' },
          { id: 'buckle_gold', label: 'Gold Buckle', description: 'Gold-toned hardware' }
        ]
      }
    ]
  },
  {
    id: 'footwear',
    label: 'Footwear',
    description: 'Shoes, boots, and sandals',
    subcategories: [
      {
        id: 'dress_shoes',
        label: 'Dress Shoes',
        description: 'Formal business and dress shoes',
        cameraFocus: 'feet',
        poseStyle: 'formal',
        placeholderText: 'e.g., oxford, black leather, cap toe, leather sole',
        details: [
          { id: 'style_oxford', label: 'Oxford', description: 'Classic lace-up dress shoe' },
          { id: 'style_derby', label: 'Derby', description: 'Open-lacing dress shoe' },
          { id: 'style_loafer', label: 'Loafer', description: 'Slip-on dress shoe' },
          { id: 'toe_cap', label: 'Cap Toe', description: 'Toe cap detail' },
          { id: 'toe_plain', label: 'Plain Toe', description: 'Simple toe design' },
          { id: 'toe_wing', label: 'Wing Tip', description: 'Decorative wing pattern' }
        ]
      },
      {
        id: 'casual_shoes',
        label: 'Casual Shoes',
        description: 'Everyday casual footwear',
        cameraFocus: 'feet',
        poseStyle: 'casual',
        placeholderText: 'e.g., sneakers, canvas, low-top, rubber sole',
        details: [
          { id: 'style_sneaker', label: 'Sneakers', description: 'Athletic-style casual shoes' },
          { id: 'style_boat', label: 'Boat Shoes', description: 'Deck shoe style' },
          { id: 'style_desert', label: 'Desert Boots', description: 'Ankle-high casual boots' },
          { id: 'height_low', label: 'Low-Top', description: 'Below ankle height' },
          { id: 'height_mid', label: 'Mid-Top', description: 'At ankle height' },
          { id: 'height_high', label: 'High-Top', description: 'Above ankle height' }
        ]
      }
    ]
  },
  {
    id: 'undergarments',
    label: 'Undergarments',
    description: 'Underwear, undershirts, and sleepwear',
    subcategories: [
      {
        id: 'underwear',
        label: 'Underwear',
        description: 'Briefs, boxers, and boxer briefs',
        cameraFocus: 'lower_body',
        poseStyle: 'static',
        placeholderText: 'e.g., boxer briefs, cotton blend, elastic waistband, tagless',
        details: [
          { id: 'style_briefs', label: 'Briefs', description: 'Classic brief style' },
          { id: 'style_boxers', label: 'Boxers', description: 'Loose boxer shorts' },
          { id: 'style_boxer_briefs', label: 'Boxer Briefs', description: 'Fitted boxer brief style' },
          { id: 'feature_tagless', label: 'Tagless', description: 'No irritating tags' },
          { id: 'waistband_elastic', label: 'Elastic Waistband', description: 'Comfortable elastic band' }
        ]
      },
      {
        id: 'undershirts',
        label: 'Undershirts',
        description: 'T-shirts and tank undershirts',
        cameraFocus: 'upper_body',
        poseStyle: 'static',
        placeholderText: 'e.g., crew neck undershirt, cotton, tagless, moisture-wicking',
        details: [
          { id: 'neck_crew', label: 'Crew Neck', description: 'Round neckline undershirt' },
          { id: 'neck_v', label: 'V-Neck', description: 'V-neck undershirt' },
          { id: 'style_tank', label: 'Tank', description: 'Sleeveless undershirt' },
          { id: 'feature_moisture_wicking', label: 'Moisture-Wicking', description: 'Sweat-wicking technology' }
        ]
      }
    ]
  }
];

export const getGarmentCategory = (categoryId: string): GarmentCategory | undefined => {
  return GARMENT_CATEGORIES.find(cat => cat.id === categoryId);
};

export const getGarmentSubcategory = (categoryId: string, subcategoryId: string): GarmentSubcategory | undefined => {
  const category = getGarmentCategory(categoryId);
  return category?.subcategories.find(sub => sub.id === subcategoryId);
};

export const getAllSubcategories = (): GarmentSubcategory[] => {
  return GARMENT_CATEGORIES.flatMap(cat => cat.subcategories);
};
