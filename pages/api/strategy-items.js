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

        switch (method) {
            case 'POST':
                if (!id) {
                    // Handle "Create" action
                    console.log('Creating new strategic item...');
                    const createdItem = await createStratregicElement(body);
                    return res.status(201).json({ message: 'Strategic item created successfully', createdItem });
                } else {
                    // Handle "Update" action
                    console.log('Updating strategic item with ID:', id);
                    const updatedItem = await updateStratregicElement({ ...body, id });
                    return res.status(200).json({ message: 'Strategic item updated successfully', updatedItem });
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
