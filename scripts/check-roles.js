#!/usr/bin/env node

/**
 * Check user roles in the database
 * 
 * Usage: node scripts/check-roles.js
 */

const { sql } = require('@vercel/postgres');

async function checkRoles() {
  try {
    // Fetch all users with their roles
    const result = await sql`
      SELECT id, email, name, role, elo, created_at
      FROM users
      ORDER BY created_at DESC
    `;

    console.log('\n📋 User Roles in Database:\n');
    console.log('─'.repeat(80));
    
    if (result.rows.length === 0) {
      console.log('No users found in database');
    } else {
      result.rows.forEach(user => {
        const roleEmoji = user.role === 'admin' ? '👑' : '👤';
        const roleColor = user.role === 'admin' ? '\x1b[31m' : '\x1b[37m'; // red for admin, white for user
        const resetColor = '\x1b[0m';
        
        console.log(`${roleEmoji} ${roleColor}${user.role.toUpperCase()}${resetColor}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Name: ${user.name || '(not set)'}`);
        console.log(`   ELO: ${user.elo}`);
        console.log(`   ID: ${user.id}`);
        console.log('─'.repeat(80));
      });
      
      const adminCount = result.rows.filter(u => u.role === 'admin').length;
      const userCount = result.rows.filter(u => u.role === 'user').length;
      
      console.log(`\nTotal: ${result.rows.length} users (${adminCount} admin, ${userCount} regular users)\n`);
    }
  } catch (error) {
    console.error('❌ Error checking roles:', error.message);
    process.exit(1);
  }
}

checkRoles();

