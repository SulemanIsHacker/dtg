// Simple script to apply the migration manually
// This will help us test the product code system

const { createClient } = require('@supabase/supabase-js');

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  try {
    console.log('Applying product code system migration...');
    
    // Read the migration file
    const fs = require('fs');
    const migrationSQL = fs.readFileSync('./supabase/migrations/20250115000032_final_product_code_fix.sql', 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = migrationSQL.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing statement...');
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          console.error('Error executing statement:', error);
        } else {
          console.log('Statement executed successfully');
        }
      }
    }
    
    console.log('Migration applied successfully!');
  } catch (error) {
    console.error('Error applying migration:', error);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  applyMigration();
}

module.exports = { applyMigration };

