import {
    createStratregicElement,
    updateStratregicElement,
    deleteStratregicElement,
    returningStratregicElement,
} from '../strategies/model/strategicElements';

export default async function handler(req, res) {
    try {
        const { method, query, body } = req;
        const { id } = query; // Extract ID from query parameters

        console.log ("Strategic-items: handler query:", query);
        console.log ("Strategic-items: handler body:", body);
        switch (method) {
            case 'POST':
                if (!id) {
                    // Handle "Create" action
                    console.log('Creating new strategic item...');
                    const createdItem = await createStratregicElement(body);
                    return res.status(201).json({ message: 'Strategic item created successfully', createdItem });
                } 
            case 'PUT':
                try {
                const { elementid } = req.query; // Element ID from query string
                const {
                    stream_id,
                    strategy_id,
                    diagnosis,
                    overall_approach,
                    set_of_coherent_actions,
                    proximate_objectives,
                } = req.body;

                // Validate input
                if (!elementid || !stream_id || !strategy_id) {
                    return res.status(400).json({ error: 'Missing required fields: elementid, stream_id, or strategy_id.' });
                }
    
                const elementToUpdate = {
                    id: elementid, // Add the elementid as `id`
                    ...req.body, // Spread the body into the object
                  };
              
                // Handle "Update" action
                console.log('Updating strategic item with ID:', elementToUpdate);
                
                const updatedItem = await updateStratregicElement({ ...elementToUpdate });
                return res.status(200).json({ message: 'Strategic item updated successfully', updatedItem });
            } catch (error) {
                // Handle errors
                console.error('Error updating strategic element:', error);
                res.status(500).json({ error: 'Internal server error.' });
            }
            case 'DELETE':
                if (!id) {
                    return res.status(400).json({ error: 'Item ID is required for deletion' });
                }
                console.log('Deleting strategic item with ID:', id);
                const deletedItem = await deleteStratregicElement(body);
                return res.status(200).json({ message: 'Strategic item deleted successfully', deletedItem });
            
            case 'GET':
                if (!id) {              
                    return res.status(400).json({ error: 'Item ID is required for deletion' });
                }
                console.log('Replaying strategic element with ID:', body);
                const replayedElement = await returningStratregicElement(body);
                return res.status(200).json({ message: 'Strategic item replayed successfully', replayedElement })

            default:
                res.setHeader('Allow', ['POST', 'DELETE']);
                return res.status(405).json({ error: `Method ${method} not allowed` });
        }
    } catch (error) {
        console.error('Error in strategic-item API:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
