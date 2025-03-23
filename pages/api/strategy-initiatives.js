import {
    createStratregicInitiative,
    updateStratregicInitiative,
    deleteStratregicInitiative,
    returningStratregicInitiative,
} from '../strategies/model/strategicInitiatives';

export default async function handler(req, res) {
    try {
        const { method, query, body } = req;
        const { initiativeId } = query; // Extract ID from query parameters

        console.log("Strategic-items: handler query:", query);
        console.log("Strategic-items: handler body:", body);
        console.log("Strategic-items: handler initiativeId:", initiativeId);

        switch (method) {
            case 'POST':
                // Handle "Create" action
                if (!body) {
                    return res.status(400).json({ error: 'Request body is required for creation' });
                }
                console.log('Creating new strategic initiative...');
                const createdItem = await createStratregicInitiative(body);
                return res.status(201).json({ message: 'Strategic initiative created successfully', data: createdItem });

            case 'PUT':
                // Handle "Update" action
                console.log("Initiative to uopate: ", initiativeId);
                if (!initiativeId) {
                    return res.status(400).json({ error: 'Item ID is required for update' });
                }
                if (!body) {
                    return res.status(400).json({ error: 'Request body is required for update' });
                }
                console.log('Updating strategic Initiative with ID:', initiativeId);
                const updatedItem = await updateStratregicInitiative({ initiativeId, ...body });
                return res.status(200).json({ message: 'Strategic Initiative updated successfully', data: updatedItem });

            case 'DELETE':
                // Handle "Delete" action
                if (!id) {
                    return res.status(400).json({ error: 'Item ID is required for deletion' });
                }
                console.log('Deleting strategic item with ID:', id);
                const deletedItem = await deleteStratregicInitiative(id);
                return res.status(200).json({ message: 'Strategic item deleted successfully', data: deletedItem });

            case 'GET':
                // Handle "Get" action
                if (!id) {
                    return res.status(400).json({ error: 'Item ID is required for retrieval' });
                }
                console.log('Replaying strategic initiative with ID:', id);
                const replayedElement = await returningStratregicInitiative(id);
                return res.status(200).json({ message: 'Strategic initiative replayed successfully', data: replayedElement });

            default:
                // Handle unsupported methods
                res.setHeader('Allow', ['POST', 'PUT', 'DELETE', 'GET']);
                return res.status(405).json({ error: `Method ${method} not allowed` });
        }
    } catch (error) {
        console.error('Error in strategic-initiatives.js API:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}