import { config } from 'dotenv';
config();

// Check .env.local are picked up
console.log('SupabaseFetchTest URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('SupabaseFetchTest Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

import { supabase } from '../../../utils/supabaseClient';

test('fetches the first name from the radars table', async () => {
    const { data, error } = await supabase
        .from('radars')
        .select('name')
        .limit(1);

    expect(error).toBeNull(); // Ensure no errors occurred
    expect(data).toBeDefined(); // Ensure data is defined
    expect(data.length).toBeGreaterThan(0); // Ensure at least one record exists
    expect(data[0].name).toBeTruthy(); // Ensure the name field is not empty
});
