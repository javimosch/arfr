client contains one folder for each implementation

Each folder has four subfolders to help in the developement of the frontend project
    - css (bundling)
    - js (bundling)
    - partials (handlebars partials)
    - res (anything)
    - static (static three rendering)
    

server has two folders, common and implementations

implementation folders contains one folder for each implementation
Each folder contains at least three folders
    - controllers (business logic exposed to routes)
    - models (mongoose schema and helpers)
    - views (handlebars partials)

    
    
#HOW TO ADD MONGOOSE MODELS

create a file in common/models or implementations/YOUR_IMPLEMENTATION_FOLDER/models

createModel('Stats', {});
createModel('File', {});
createModel('Email', {});
createModel('Stripe', {});
createModel('Settings', require('../schemas/schema.diags-settings').def);
createModel('Pdf', require('../schemas/schema.pdf').def);
createModel('Category', require('../schemas/schema.category').def);
createModel('Log', require('../schemas/schema.log').def);
createModel('StripeTransaction', require('../schemas/schema.diags-stripe-transaction').def);
createModel('Balance', require('../schemas/schema.balance').def);
createModel('BalanceItem', require('../schemas/schema.balance-item').def);
createModel('TimeRange', require('../schemas/schema.time-range').def);
createModel('htmls', require('../schemas/schema.htmls').def);
createModel('pages', require('../schemas/schema.pages').def);
    
    