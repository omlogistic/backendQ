



const pool = require("../config/db");

// Add Vendor Services with Email
// const addVendorServices = async (req, res) => {
//     const { vendor_id, email, services } = req.body;

//     // Validate input
//     if (!vendor_id || !email || !Array.isArray(services) || services.length === 0) {
//         return res.status(400).json({ error: "Vendor ID, email, and at least one service are required" });
//     }

//     try {
//         await pool.query("BEGIN"); // Start transaction

//         // Insert services
//         for (const service of services) {
//             await pool.query(
//                 "INSERT INTO vendor_services (vendor_id, email, service_name, service_price) VALUES ($1, $2, $3, $4)",
//                 [vendor_id, email, service.service_name, service.service_price]
//             );
//         }

//         await pool.query("COMMIT"); // Commit transaction
//         return res.status(201).json({ message: "Services added successfully" });

//     } catch (error) {
//         await pool.query("ROLLBACK"); // Rollback on error
//         console.error("Error adding services:", error);
//         return res.status(500).json({ error: "Internal Server Error" });
//     }
// };

const addVendorServices = async (req, res) => {
    const { vendor_id, email, services } = req.body;

    // Validate input
    if (!vendor_id || !email || !Array.isArray(services) || services.length === 0) {
        return res.status(400).json({ error: "Vendor ID, email, and at least one service are required" });
    }

    try {
        await pool.query("BEGIN"); // Start transaction

        for (const service of services) {
            // Check if the service already exists
            const existingService = await pool.query(
                "SELECT id FROM vendor_services WHERE vendor_id = $1 AND service_name = $2",
                [vendor_id, service.service_name]
            );

            if (existingService.rows.length > 0) {
                return res.status(400).json({ error: `Service '${service.service_name}' already exists for this vendor` });
            }

            // Insert new service if it doesn't exist
            await pool.query(
                "INSERT INTO vendor_services (vendor_id, email, service_name, service_price) VALUES ($1, $2, $3, $4)",
                [vendor_id, email, service.service_name, service.service_price]
            );
        }

        await pool.query("COMMIT"); // Commit transaction
        return res.status(201).json({ message: "Services added successfully" });

    } catch (error) {
        await pool.query("ROLLBACK"); // Rollback on error
        console.error("Error adding services:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


// Get Vendor Services by Email
const getVendorServicesByEmail = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    try {
        const result = await pool.query(
            "SELECT service_name, service_price FROM vendor_services WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No services found for this email" });
        }

        return res.status(200).json({
            vendor_email: email,
            services: result.rows // Now each service object does not contain 'email'
        });

    } catch (error) {
        console.error("Error fetching services:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


module.exports = { addVendorServices, getVendorServicesByEmail };

