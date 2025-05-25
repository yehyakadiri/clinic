import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import mysql from 'mysql';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8082;

// JWT Configuration
const JWT_SECRET = 'your-very-secret-key';

// Multer Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL Configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: ''
};

// Helper function for database queries
function executeQuery(connection, sql, params = []) {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

// Initialize database and start server
async function initializeDatabaseAndStartServer() {
  // First connect without database specified
  const initConnection = mysql.createConnection(dbConfig);
  
  try {
    // Connect to MySQL server
    await executeQuery(initConnection, 'CREATE DATABASE IF NOT EXISTS clinic');
    console.log('Database "clinic" created or already exists');
    
    // Switch to clinic database
    await executeQuery(initConnection, 'USE clinic');
    
    // Create all tables
    await executeQuery(initConnection, `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(191) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('doctor', 'secretary') NOT NULL
      )
    `);

    await executeQuery(initConnection, `
      CREATE TABLE IF NOT EXISTS patients (
        id VARCHAR(36) PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        date_of_birth DATE NOT NULL,
        gender ENUM('Male', 'Female') NOT NULL,
        parent_name VARCHAR(100) NOT NULL,
        parent_occupation VARCHAR(100),
        address TEXT NOT NULL,
        mother_phone VARCHAR(20),
        father_phone VARCHAR(20),
        home_phone VARCHAR(20),
        email VARCHAR(100) NOT NULL,
        insurance_info TEXT NOT NULL,
        school_name VARCHAR(100),
        delivery_type ENUM('C-Section', 'NVD') NOT NULL,
        weeks_of_gestation INT NOT NULL,
        birth_weight DECIMAL(4,2) NOT NULL,
        birth_height DECIMAL(5,2) NOT NULL,
        head_circumference DECIMAL(5,2) NOT NULL,
        prenatal_complications TEXT NOT NULL,
        icn_admission ENUM('Yes', 'No') NOT NULL,
        icn_admission_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await executeQuery(initConnection, `
      CREATE TABLE IF NOT EXISTS consultations (
        id VARCHAR(36) PRIMARY KEY,
        patient_id VARCHAR(36) NOT NULL,
        type ENUM('vaccine', 'well-child', 'disease') NOT NULL,
        date DATE NOT NULL,
        notes TEXT,
        vaccine_name VARCHAR(100),
        child_age VARCHAR(50),
        weight DECIMAL(5,2),
        height DECIMAL(5,2),
        head_circumference DECIMAL(5,2),
        pulse INT,
        temperature DECIMAL(3,1),
        blood_pressure VARCHAR(20),
        respiratory_rate INT,
        symptoms TEXT,
        diagnosis VARCHAR(100),
        medication VARCHAR(100),
        dosage VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
      )
    `);

    await executeQuery(initConnection, `
      CREATE TABLE IF NOT EXISTS vaccinations (
        id VARCHAR(36) PRIMARY KEY,
        patient_id VARCHAR(36) NOT NULL,
        name VARCHAR(100) NOT NULL,
        alternatives VARCHAR(255),
        dose VARCHAR(50) NOT NULL,
        child_age VARCHAR(50) NOT NULL,
        date_administered DATE NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
      )
    `);

    await executeQuery(initConnection, `
      CREATE TABLE IF NOT EXISTS screening_tests (
        id VARCHAR(36) PRIMARY KEY,
        patient_id VARCHAR(36) NOT NULL,
        type VARCHAR(100) NOT NULL,
        performed ENUM('Yes', 'No') NOT NULL,
        result ENUM('Normal', 'Abnormal') NOT NULL,
        performed_date DATE NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
      )
    `);

    await executeQuery(initConnection, `
      CREATE TABLE IF NOT EXISTS diagnostics (
        id VARCHAR(36) PRIMARY KEY,
        patient_id VARCHAR(36) NOT NULL,
        test VARCHAR(100) NOT NULL,
        observations TEXT,
        result ENUM('Normal', 'Abnormal', 'Pending') NOT NULL,
        test_date DATE NOT NULL,
        file_path VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
      )
    `);

    await executeQuery(initConnection, `
      CREATE TABLE IF NOT EXISTS family_history (
        id VARCHAR(36) PRIMARY KEY,
        patient_id VARCHAR(36) NOT NULL,
        medical_condition VARCHAR(100) NOT NULL,
        father BOOLEAN DEFAULT FALSE,
        mother BOOLEAN DEFAULT FALSE,
        other BOOLEAN DEFAULT FALSE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
      )
    `);

    await executeQuery(initConnection, `
      CREATE TABLE IF NOT EXISTS surgical_history (
        id VARCHAR(36) PRIMARY KEY,
        patient_id VARCHAR(36) NOT NULL,
        type VARCHAR(100) NOT NULL,
        date DATE NOT NULL,
        age_at_surgery VARCHAR(50),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
      )
    `);

    await executeQuery(initConnection, `
      CREATE TABLE IF NOT EXISTS allergy_history (
        id VARCHAR(36) PRIMARY KEY,
        patient_id VARCHAR(36) NOT NULL,
        allergy_type VARCHAR(100) NOT NULL,
        name VARCHAR(100) NOT NULL,
        test_done BOOLEAN DEFAULT FALSE,
        test_results TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
      )
    `);

    await executeQuery(initConnection, `
      CREATE TABLE IF NOT EXISTS chronic_therapy (
        id VARCHAR(36) PRIMARY KEY,
        patient_id VARCHAR(36) NOT NULL,
        medication VARCHAR(100) NOT NULL,
        birth_to_1_year_prevention TEXT,
        one_year_to_2_years_prevention TEXT,
        treatment TEXT NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
      )
    `);

    await executeQuery(initConnection, `
      CREATE TABLE IF NOT EXISTS allergy_treatment (
        id VARCHAR(36) PRIMARY KEY,
        patient_id VARCHAR(36) NOT NULL,
        allergy_type VARCHAR(100) NOT NULL,
        treatment_date DATE NOT NULL,
        medication VARCHAR(100) NOT NULL,
        dosage VARCHAR(100) NOT NULL,
        frequency VARCHAR(100) NOT NULL,
        duration VARCHAR(100) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
      )
    `);

    await executeQuery(initConnection, `
      CREATE TABLE IF NOT EXISTS billing (
        id VARCHAR(36) PRIMARY KEY,
        patient_id VARCHAR(36) NOT NULL,
        service VARCHAR(100) NOT NULL,
        date DATE NOT NULL,
        cost DECIMAL(10,2) NOT NULL,
        paid BOOLEAN DEFAULT FALSE,
        paid_amount DECIMAL(10,2) DEFAULT 0,
        unpaid_amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
      )
    `);

    await executeQuery(initConnection, `
      CREATE TABLE IF NOT EXISTS appointments (
        id VARCHAR(36) PRIMARY KEY,
        patient_name VARCHAR(100) NOT NULL,
        date DATE NOT NULL,
        time VARCHAR(10) NOT NULL,
        type VARCHAR(50) NOT NULL,
        reason VARCHAR(255),
        status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await executeQuery(initConnection, `
      CREATE TABLE IF NOT EXISTS medical_records (
        id VARCHAR(36) PRIMARY KEY,
        patient_id VARCHAR(36) NOT NULL,
        visit_date DATE NOT NULL,
        visit_type ENUM('vaccine', 'wellChild', 'disease') NOT NULL,
        weight DECIMAL(5,2) NOT NULL,
        height DECIMAL(5,2) NOT NULL,
        head_circumference DECIMAL(5,2) NOT NULL,
        pulse INT NOT NULL,
        temperature DECIMAL(4,1) NOT NULL,
        blood_pressure VARCHAR(20) NOT NULL,
        respiratory_rate INT NOT NULL,
        vaccine_name VARCHAR(100),
        child_age VARCHAR(50),
        vaccine_notes TEXT,
        well_child_notes TEXT,
        symptoms TEXT,
        diagnosis VARCHAR(100),
        treatment TEXT,
        prescribed_medications TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
      )
    `);

    console.log('All tables created or already exist');
    
    // Insert default users if they don't exist
    const existingUsers = await executeQuery(initConnection, 'SELECT * FROM users WHERE email IN (?, ?)', 
      ['dr.lina@clinic.com', 'secretary@clinic.com']);
    
    if (existingUsers.length === 0) {
      await executeQuery(initConnection, `
        INSERT INTO users (name, email, password, role)
        VALUES 
          ('Dr. Lina', 'dr.lina@clinic.com', 'drlina123', 'doctor'),
          ('Clinic Secretary', 'secretary@clinic.com', 'secretary123', 'secretary')
      `);
      console.log('Default users created');
    } else {
      console.log('Default users already exist');
    }
    
    // Close the initialization connection
    initConnection.end();
    
    // Now create the main database connection for the app
    const db = mysql.createConnection({
      ...dbConfig,
      database: 'clinic'
    });
    
    // Connect to the database
    db.connect((err) => {
      if (err) throw err;
      console.log('Connected to MySQL database "clinic"');

      // ✅ Login Route (No Hashing)
      app.post('/login', async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
          return res.status(400).json({ message: 'Email and password are required' });
        }

        try {
          const results = await executeQuery(db, 'SELECT * FROM users WHERE email = ?', [email]);

          if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
          }

          const user = results[0];

          if (password !== user.password) {
            return res.status(401).json({ message: 'Invalid email or password' });
          }

          const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '1d' }
          );

          res.json({
            message: 'Login successful',
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role
            },
            token
          });
        } catch (err) {
          console.error('Login error:', err);
          res.status(500).json({ message: 'Internal server error' });
        }
      });

      // Add this to your server.js
      app.get('/patients/:id', async (req, res) => {
        try {
          const { id } = req.params;
          const sql = 'SELECT * FROM patients WHERE id = ?';
          const results = await executeQuery(db, sql, [id]);

          if (results.length === 0) {
            return res.status(404).json({ message: 'Patient not found' });
          }

          res.json(results[0]);
        } catch (err) {
          console.error('Error fetching patient:', err);
          res.status(500).json({ message: 'Internal server error' });
        }
      });

      app.post('/patients', async (req, res) => {
        try {
          const patient = req.body;
          const id = uuidv4(); // generate unique ID

          const sql = `
            INSERT INTO patients (
              id, full_name, date_of_birth, gender, parent_name, parent_occupation, address,
              mother_phone, father_phone, home_phone, email, insurance_info, school_name,
              delivery_type, weeks_of_gestation, birth_weight, birth_height, head_circumference,
              prenatal_complications, icn_admission, icn_admission_reason
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

          const values = [
            id, patient.full_name, patient.date_of_birth, patient.gender, patient.parent_name,
            patient.parent_occupation, patient.address, patient.mother_phone, patient.father_phone,
            patient.home_phone, patient.email, patient.insurance_info, patient.school_name,
            patient.delivery_type, patient.weeks_of_gestation, patient.birth_weight,
            patient.birth_height, patient.head_circumference, patient.prenatal_complications,
            patient.icn_admission, patient.icn_admission_reason
          ];

          await executeQuery(db, sql, values);
          res.status(201).json({ message: 'Patient added successfully', id });
        } catch (err) {
          console.error('Error adding patient:', err);
          res.status(500).json({ message: 'Internal server error' });
        }
      });

      app.get('/patients', async (req, res) => {
        try {
          const sql = `
            SELECT 
              id,
              full_name,
              TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) AS age,
              gender
            FROM patients
          `;

          const results = await executeQuery(db, sql);

          // Simulate diagnosis tag (you can later fetch it from another table)
          const withDiagnosis = results.map(p => ({
            ...p,
            diagnosis: p.full_name.includes('Sarah') ? 'Asthma' :
                      p.full_name.includes('Thomas') ? 'Allergies' :
                      p.full_name.includes('Emma') ? 'Eczema' : 'N/A'
          }));

          res.json(withDiagnosis);
        } catch (err) {
          console.error('Error fetching patients:', err);
          res.status(500).json({ message: 'Internal server error' });
        }
      });

      // Consultations routes
      app.get('/patients/:id/consultations', async (req, res) => {
        try {
          const { id } = req.params;
          const sql = 'SELECT * FROM consultations WHERE patient_id = ? ORDER BY date DESC';
          const results = await executeQuery(db, sql, [id]);
          res.json(results);
        } catch (err) {
          console.error('Error fetching consultations:', err);
          res.status(500).json({ message: 'Internal server error' });
        }
      });

      app.post('/patients/:id/consultations', async (req, res) => {
        try {
          const { id } = req.params;
          const consultation = req.body;
          const consultationId = uuidv4();

          const sql = `
            INSERT INTO consultations (
              id, patient_id, type, date, notes, 
              vaccine_name, child_age, weight, height, head_circumference,
              pulse, temperature, blood_pressure, respiratory_rate,
              symptoms, diagnosis, medication, dosage
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

          const values = [
            consultationId, id, consultation.type, consultation.date, consultation.notes,
            consultation.vaccineName || null, consultation.childAge || null, 
            consultation.weight || null, consultation.height || null, 
            consultation.headCircumference || null,
            consultation.pulse || null, consultation.temperature || null,
            consultation.bloodPressure || null, consultation.respiratoryRate || null,
            consultation.symptoms || null, consultation.diagnosis || null,
            consultation.medication || null, consultation.dosage || null
          ];

          await executeQuery(db, sql, values);
          res.status(201).json({ message: 'Consultation added successfully', id: consultationId });
        } catch (err) {
          console.error('Error adding consultation:', err);
          res.status(500).json({ message: 'Internal server error' });
        }
      });

      // Medical Record routes
      app.get('/patients/:id/medical-record', async (req, res) => {
        try {
          const { id } = req.params;
          // Implement your logic to fetch medical records
          res.json({}); // Return empty object for now
        } catch (err) {
          console.error('Error fetching medical record:', err);
          res.status(500).json({ message: 'Internal server error' });
        }
      });

      // Vaccinations routes
      app.get('/patients/:id/vaccinations', async (req, res) => {
        try {
          const { id } = req.params;
          const sql = `
            SELECT 
              id,
              name,
              alternatives,
              dose,
              child_age as childAge,
              DATE_FORMAT(date_administered, '%Y-%m-%d') as dateAdministered,
              notes
            FROM vaccinations 
            WHERE patient_id = ? 
            ORDER BY date_administered DESC
          `;
          const results = await executeQuery(db, sql, [id]);
          res.json(results);
        } catch (err) {
          console.error('Error fetching vaccinations:', err);
          res.status(500).json({ message: 'Internal server error' });
        }
      });

      app.post('/patients/:id/vaccinations', async (req, res) => {
        try {
          const { id } = req.params;
          const vaccination = req.body;
          
          // Validate required fields
          if (!vaccination.name || !vaccination.dose || !vaccination.childAge || !vaccination.dateAdministered) {
            return res.status(400).json({ message: 'Missing required fields' });
          }
          
          const vaccinationId = uuidv4();

          const sql = `
            INSERT INTO vaccinations (
              id, patient_id, name, alternatives, dose, 
              child_age, date_administered, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `;

          const values = [
            vaccinationId, id, 
            vaccination.name, 
            vaccination.alternatives || null,
            vaccination.dose,
            vaccination.childAge,
            vaccination.dateAdministered,
            vaccination.notes || null
          ];

          await executeQuery(db, sql, values);
          res.status(201).json({ 
            message: 'Vaccination added successfully', 
            id: vaccinationId,
            vaccination: {
              id: vaccinationId,
              ...vaccination
            }
          });
        } catch (err) {
          console.error('Error adding vaccination:', err);
          res.status(500).json({ message: 'Internal server error' });
        }
      });

      app.put('/vaccinations/:id', async (req, res) => {
        try {
          const { id } = req.params;
          const { name, alternatives, dose, child_age, date_administered, notes } = req.body;

          // Validate required fields
          if (!name || !dose || !child_age || !date_administered) {
            return res.status(400).json({ message: 'Missing required fields' });
          }

          const sql = `
            UPDATE vaccinations SET
              name = ?,
              alternatives = ?,
              dose = ?,
              child_age = ?,
              date_administered = ?,
              notes = ?
            WHERE id = ?
          `;

          const values = [
            name,
            alternatives || null,
            dose,
            child_age,
            date_administered,
            notes || null,
            id
          ];

          const result = await executeQuery(db, sql, values);
          
          if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Vaccination not found' });
          }
          
          // Return the updated vaccination
          const updatedVaccination = await executeQuery(db, 
            'SELECT * FROM vaccinations WHERE id = ?', 
            [id]
          );
          
          res.json(updatedVaccination[0]);
        } catch (err) {
          console.error('Error updating vaccination:', err);
          res.status(500).json({ message: 'Internal server error' });
        }
      });

      app.delete('/vaccinations/:id', async (req, res) => {
        try {
          const { id } = req.params;
          
          const sql = 'DELETE FROM vaccinations WHERE id = ?';
          const result = await executeQuery(db, sql, [id]);
          
          if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Vaccination not found' });
          }
          
          res.json({ message: 'Vaccination deleted successfully' });
        } catch (err) {
          console.error('Error deleting vaccination:', err);
          res.status(500).json({ message: 'Internal server error' });
        }
      });

      // Screening Tests routes
      app.get('/patients/:id/screening-tests', async (req, res) => {
        try {
          const { id } = req.params;
          const sql = 'SELECT * FROM screening_tests WHERE patient_id = ? ORDER BY performed_date DESC';
          const results = await executeQuery(db, sql, [id]);
          res.json(results);
        } catch (err) {
          console.error('Error fetching screening tests:', err);
          res.status(500).json({ message: 'Internal server error' });
        }
      });

      app.post('/patients/:id/screening-tests', async (req, res) => {
        try {
          const { id } = req.params;
          const { type, performed, result, performedDate, notes } = req.body;
          
          console.log('Received screening test data:', req.body);
          
          if (!type || !performed || !result || !performedDate) {
            return res.status(400).json({ message: 'Missing required fields' });
          }

          const testId = uuidv4();
          
          const sql = `
            INSERT INTO screening_tests 
            (id, patient_id, type, performed, result, performed_date, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `;
          
          await executeQuery(db, sql, [
            testId, id, type, performed, result, performedDate, notes || null
          ]);
          
          // Return the complete created record
          const [newTest] = await executeQuery(db, 
            'SELECT * FROM screening_tests WHERE id = ?', 
            [testId]
          );
          
          res.status(201).json(newTest);
          
        } catch (err) {
          console.error('Error adding screening test:', err);
          res.status(500).json({ message: 'Internal server error' });
        }
      });

      // Diagnostics routes
      app.get('/patients/:id/diagnostics', async (req, res) => {
        try {
          const { id } = req.params;
          const sql = 'SELECT * FROM diagnostics WHERE patient_id = ? ORDER BY test_date DESC';
          const results = await executeQuery(db, sql, [id]);
          res.json(results);
        } catch (err) {
          console.error('Error fetching diagnostics:', err);
          res.status(500).json({ message: 'Internal server error' });
        }
      });

      app.post('/patients/:id/diagnostics', upload.single('file'), async (req, res) => {
        try {
          const { id } = req.params;
          const { test, observations, result, testDate } = req.body;
          const filePath = req.file ? req.file.path : null;
          
          console.log('Received diagnostic data:', { 
            test, observations, result, testDate, filePath 
          });
          
          if (!test || !result || !testDate) {
            return res.status(400).json({ message: 'Missing required fields' });
          }

          const diagnosticId = uuidv4();
          
          const sql = `
            INSERT INTO diagnostics 
            (id, patient_id, test, observations, result, test_date, file_path)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `;
          
          await executeQuery(db, sql, [
            diagnosticId, id, test, observations || null, result, testDate, filePath
          ]);
          
          // Return the complete created record
          const [newDiagnostic] = await executeQuery(db, 
            'SELECT * FROM diagnostics WHERE id = ?', 
            [diagnosticId]
          );
          
          res.status(201).json(newDiagnostic);
          
        } catch (err) {
          console.error('Error adding diagnostic:', err);
          res.status(500).json({ message: 'Internal server error' });
        }
      });

      // Family History Routes
      app.get('/patients/:id/family-history', async (req, res) => {
        try {
          const { id } = req.params;
          const sql = 'SELECT * FROM family_history WHERE patient_id = ? ORDER BY created_at DESC';
          const results = await executeQuery(db, sql, [id]);
          res.json(results);
        } catch (err) {
          console.error('Error fetching family history:', err);
          res.status(500).json({ message: 'Internal server error' });
        }
      });

      app.post('/patients/:id/family-history', async (req, res) => {
        try {
          const { id } = req.params;
          const { medical_condition, father, mother, other, notes } = req.body;
          
          if (!medical_condition) {
            return res.status(400).json({ message: 'Condition is required' });
          }

          const recordId = uuidv4();
          
          const sql = `
            INSERT INTO family_history 
            (id, patient_id, medical_condition, father, mother, other, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `;
          
          await executeQuery(db, sql, [
            recordId, id, medical_condition, 
            father || false, 
            mother || false, 
            other || false, 
            notes || null
          ]);
          
          const [newRecord] = await executeQuery(db, 
            'SELECT * FROM family_history WHERE id = ?', 
            [recordId]
          );
          
          res.status(201).json(newRecord);
        } catch (err) {
          console.error('Error adding family history:', err);
          res.status(500).json({ message: 'Internal server error' });
        }
      });

      // Surgical History Routes
      app.get('/patients/:id/surgical-history', async (req, res) => {
        try {
          const { id } = req.params;
          const sql = 'SELECT * FROM surgical_history WHERE patient_id = ? ORDER BY date DESC';
          const results = await executeQuery(db, sql, [id]);
          res.json(results);
        } catch (err) {
          console.error('Error fetching surgical history:', err);
          res.status(500).json({ message: 'Internal server error' });
        }
      });

      app.post('/patients/:id/surgical-history', async (req, res) => {
        try {
          const { id } = req.params;
          const { type, date, ageAtSurgery, notes } = req.body;
          
          if (!type || !date) {
            return res.status(400).json({ message: 'Type and date are required' });
          }

          const recordId = uuidv4();
          
          const sql = `
            INSERT INTO surgical_history 
            (id, patient_id, type, date, age_at_surgery, notes)
            VALUES (?, ?, ?, ?, ?, ?)
          `;
          
          await executeQuery(db, sql, [
            recordId, id, type, date, ageAtSurgery || null, notes || null
          ]);
          
          const [newRecord] = await executeQuery(db, 
            'SELECT * FROM surgical_history WHERE id = ?', 
            [recordId]
          );
          
          res.status(201).json(newRecord);
        } catch (err) {
          console.error('Error adding surgical history:', err);
          res.status(500).json({ message: 'Internal server error' });
        }
      });

      // Allergy History Routes
      app.get('/patients/:id/allergy-history', async (req, res) => {
        try {
          const { id } = req.params;
          const sql = 'SELECT * FROM allergy_history WHERE patient_id = ? ORDER BY created_at DESC';
          const results = await executeQuery(db, sql, [id]);
          res.json(results);
        } catch (err) {
          console.error('Error fetching allergy history:', err);
          res.status(500).json({ message: 'Internal server error' });
        }
      });

      app.post('/patients/:id/allergy-history', async (req, res) => {
        try {
          const { id } = req.params;
          const { allergy_type, name, test_done, test_results, notes } = req.body;

          console.log('Received allergy history data:', req.body);

          // Validate required fields
          if (!allergy_type || !name) {
            return res.status(400).json({ 
              message: 'Allergy type and name are required',
              received: req.body 
            });
          }

          const recordId = uuidv4();
          
          const sql = `
            INSERT INTO allergy_history 
            (id, patient_id, allergy_type, name, test_done, test_results, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `;
          
          await executeQuery(db, sql, [
            recordId, 
            id, 
            allergy_type,
            name,
            test_done || false,
            test_results || null,
            notes || null
          ]);
          
          // Return the complete created record
          const [newRecord] = await executeQuery(db, 
            'SELECT * FROM allergy_history WHERE id = ?', 
            [recordId]
          );
          
          res.status(201).json(newRecord);
          
        } catch (err) {
          console.error('Database error:', {
            message: err.message,
            sql: err.sql,
            stack: err.stack
          });
          res.status(500).json({ 
            message: 'Failed to add allergy history',
            error: err.message,
            details: err.sqlMessage 
          });
        }
      });

      // Chronic Therapy Routes
      app.get('/patients/:id/chronic-therapy', async (req, res) => {
        try {
          const { id } = req.params;
          const sql = 'SELECT * FROM chronic_therapy WHERE patient_id = ? ORDER BY created_at DESC';
          const results = await executeQuery(db, sql, [id]);
          res.json(results);
        } catch (err) {
          console.error('Error fetching chronic therapy:', err);
          res.status(500).json({ message: 'Internal server error' });
        }
      });

      app.post('/patients/:id/chronic-therapy', async (req, res) => {
        try {
          const { id } = req.params;
          const { 
            medication,
            birth_to_1_year_prevention,
            one_year_to_2_years_prevention,
            treatment,
            notes
          } = req.body;

          console.log('Received chronic therapy:', req.body);

          // Validate required fields
          if (!medication || !treatment) {
            return res.status(400).json({
              message: 'Medication and treatment are required fields',
              received: req.body
            });
          }

          const recordId = uuidv4();
          
          const sql = `
            INSERT INTO chronic_therapy 
            (id, patient_id, medication, birth_to_1_year_prevention, 
             one_year_to_2_years_prevention, treatment, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `;
          
          await executeQuery(db, sql, [
            recordId, id, 
            medication,
            birth_to_1_year_prevention || null,
            one_year_to_2_years_prevention || null,
            treatment,
            notes || null
          ]);
          
          // Return the complete record
          const [newRecord] = await executeQuery(db, 
            'SELECT * FROM chronic_therapy WHERE id = ?', 
            [recordId]
          );
          
          res.status(201).json(newRecord);
          
        } catch (err) {
          console.error('Database error:', {
            message: err.message,
            sql: err.sql,
            stack: err.stack
          });
          
          res.status(500).json({ 
            message: 'Failed to add chronic therapy',
            error: err.message,
            sqlMessage: err.sqlMessage 
          });
        }
      });

      // Allergy Treatment Routes
      app.get('/patients/:id/allergy-treatment', async (req, res) => {
        try {
          const { id } = req.params;
          const sql = 'SELECT * FROM allergy_treatment WHERE patient_id = ? ORDER BY treatment_date DESC';
          const results = await executeQuery(db, sql, [id]);
          res.json(results);
        } catch (err) {
          console.error('Error fetching allergy treatment:', err);
          res.status(500).json({ message: 'Internal server error' });
        }
      });

      app.post('/patients/:id/allergy-treatment', async (req, res) => {
        try {
          const { id } = req.params;
          const { 
            allergy_type, 
            treatment_date, 
            medication, 
            dosage, 
            frequency, 
            duration, 
            notes 
          } = req.body;

          console.log('Received allergy treatment:', req.body);

          // Validate required fields
          const requiredFields = [
            'allergy_type', 'treatment_date', 'medication',
            'dosage', 'frequency', 'duration'
          ];
          const missingFields = requiredFields.filter(field => !req.body[field]);
          
          if (missingFields.length > 0) {
            return res.status(400).json({
              message: `Missing required fields: ${missingFields.join(', ')}`,
              received: req.body
            });
          }

          // Validate date format
          if (isNaN(Date.parse(treatment_date))) {
            return res.status(400).json({
              message: 'Invalid date format for treatment_date',
              received: treatment_date
            });
          }

          const recordId = uuidv4();
          
          const sql = `
            INSERT INTO allergy_treatment 
            (id, patient_id, allergy_type, treatment_date, medication, 
             dosage, frequency, duration, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          
          await executeQuery(db, sql, [
            recordId, id, allergy_type, treatment_date, medication,
            dosage, frequency, duration, notes || null
          ]);
          
          // Return the complete record
          const [newRecord] = await executeQuery(db, 
            'SELECT * FROM allergy_treatment WHERE id = ?', 
            [recordId]
          );
          
          res.status(201).json(newRecord);
          
        } catch (err) {
          console.error('Database error:', {
            message: err.message,
            sql: err.sql,
            stack: err.stack
          });
          
          res.status(500).json({ 
            message: 'Failed to add allergy treatment',
            error: err.message,
            sqlMessage: err.sqlMessage 
          });
        }
      });

      app.get('/patients/:id/billing', async (req, res) => {
        try {
          const { id } = req.params;
          const sql = `
            SELECT 
              id,
              service,
              DATE_FORMAT(date, '%Y-%m-%d') as date,
              cost,
              paid,
              paid_amount,
              unpaid_amount,
              payment_method,
              notes
            FROM billing 
            WHERE patient_id = ? 
            ORDER BY date DESC
          `;
          const results = await executeQuery(db, sql, [id]);
          res.json(results);
        } catch (err) {
          console.error('Error fetching billing records:', err);
          res.status(500).json({ 
            message: 'Failed to fetch billing records',
            error: err.message 
          });
        }
      });

      // Add new billing record
      app.post('/patients/:id/billing', async (req, res) => {
        try {
          const { id } = req.params;
          const {
            service,
            date,
            cost,
            paid,
            paid_amount,
            unpaid_amount,
            payment_method,
            notes
          } = req.body;

          // Validate required fields
          if (!service || !date || cost === undefined || unpaid_amount === undefined) {
            return res.status(400).json({ 
              message: 'Service, date, cost and unpaid amount are required',
              received: req.body
            });
          }

          // Convert to numbers
          const costNum = parseFloat(cost);
          const paidAmountNum = parseFloat(paid_amount) || 0;
          const unpaidAmountNum = parseFloat(unpaid_amount);

          if (isNaN(costNum) ){
            return res.status(400).json({ message: 'Cost must be a valid number' });
          }

          const billingId = uuidv4();
          
          const sql = `
            INSERT INTO billing (
              id, patient_id, service, date, cost, paid, 
              paid_amount, unpaid_amount, payment_method, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          
          await executeQuery(db, sql, [
            billingId, 
            id, 
            service, 
            date, 
            costNum, 
            Boolean(paid),
            paidAmountNum,
            unpaidAmountNum,
            payment_method || null,
            notes || null
          ]);
          
          // Return the created record
          const [newRecord] = await executeQuery(db, `
            SELECT * FROM billing WHERE id = ?
          `, [billingId]);
          
          res.status(201).json(newRecord);
        } catch (err) {
          console.error('Error adding billing record:', err);
          res.status(500).json({ 
            message: 'Failed to add billing record',
            error: err.message
          });
        }
      });

      // Update billing record (mainly for payment updates)
      app.put('/billing/:id', async (req, res) => {
        try {
          const { id } = req.params;
          const {
            paid,
            paid_amount,
            unpaid_amount,
            payment_method,
            notes
          } = req.body;

          // Validate required fields for payment update
          if (paid === undefined || paid_amount === undefined || unpaid_amount === undefined) {
            return res.status(400).json({ 
              message: 'Paid status and amounts are required',
              received: req.body
            });
          }

          const sql = `
            UPDATE billing SET
              paid = ?,
              paid_amount = ?,
              unpaid_amount = ?,
              payment_method = ?,
              notes = ?
            WHERE id = ?
          `;
          
          const result = await executeQuery(db, sql, [
            Boolean(paid),
            parseFloat(paid_amount),
            parseFloat(unpaid_amount),
            payment_method || null,
            notes || null,
            id
          ]);
          
          if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Billing record not found' });
          }
          
          // Return the updated record
          const [updatedRecord] = await executeQuery(db, `
            SELECT 
              id,
              service,
              DATE_FORMAT(date, '%Y-%m-%d') as date,
              cost,
              paid,
              paid_amount,
              unpaid_amount,
              payment_method,
              notes
            FROM billing 
            WHERE id = ?
          `, [id]);
          
          res.json(updatedRecord);
        } catch (err) {
          console.error('Error updating billing record:', {
            message: err.message,
            sql: err.sql,
            stack: err.stack
          });
          res.status(500).json({ 
            message: 'Failed to update billing record',
            error: err.message,
            sqlMessage: err.sqlMessage 
          });
        }
      });

      // Delete billing record (optional)
      app.delete('/billing/:id', async (req, res) => {
        try {
          const { id } = req.params;
          const sql = 'DELETE FROM billing WHERE id = ?';
          const result = await executeQuery(db, sql, [id]);
          
          if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Billing record not found' });
          }
          
          res.json({ message: 'Billing record deleted successfully' });
        } catch (err) {
          console.error('Error deleting billing record:', err);
          res.status(500).json({ 
            message: 'Failed to delete billing record',
            error: err.message 
          });
        }
      });

      // Dashboard Statistics
      app.get('/dashboard/stats', async (req, res) => {
        try {
          // Get total patients count
          const [patientsResult] = await executeQuery(db, 'SELECT COUNT(*) as totalPatients FROM patients');
          
          // Get today's appointments count from appointments table
          const today = new Date().toISOString().split('T')[0];
          const [appointmentsResult] = await executeQuery(db, 
            'SELECT COUNT(*) as todayAppointments FROM appointments WHERE date = ? AND status = "scheduled"', 
            [today]
          );
          
          // Get completed appointments count (last 30 days) from appointments table
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const [completedResult] = await executeQuery(db, 
            'SELECT COUNT(*) as completedAppointments FROM appointments WHERE date BETWEEN ? AND ? AND status = "completed"',
            [thirtyDaysAgo.toISOString().split('T')[0], today]
          );
          
          res.json({
            totalPatients: patientsResult.totalPatients,
            upcomingAppointments: appointmentsResult.todayAppointments,
            completedAppointments: completedResult.completedAppointments
          });
        } catch (err) {
          console.error('Error fetching dashboard stats:', err);
          res.status(500).json({ message: 'Internal server error' });
        }
      });

      // Today's Appointments
      app.get('/dashboard/today-appointments', async (req, res) => {
        try {
          const today = new Date().toISOString().split('T')[0];
          
          const sql = `
            SELECT 
              a.id,
              a.patient_name as patientName,
              a.type as reason,
              DATE_FORMAT(a.date, '%Y-%m-%d') as date,
              a.time,
              a.status
            FROM appointments a
            WHERE a.date = ? 
            AND a.status = 'scheduled'
            ORDER BY 
              CASE 
                WHEN a.time IS NOT NULL THEN STR_TO_DATE(a.time, '%H:%i')
                ELSE STR_TO_DATE('23:59', '%H:%i')
              END ASC
            LIMIT 3
          `;
          
          const results = await executeQuery(db, sql, [today]);
          
          // Format the response consistently
          const formattedResults = results.map(appt => ({
            ...appt,
            time: appt.time || '--:--' // Handle null times
          }));
          
          res.json(formattedResults);
        } catch (err) {
          console.error('Error fetching today\'s appointments:', {
            error: err.message,
            stack: err.stack,
            timestamp: new Date().toISOString()
          });
          
          res.status(500).json({ 
            message: 'Failed to fetch today\'s appointments',
            error: process.env.NODE_ENV === 'development' ? err.message : null
          });
        }
      });

      // Appointments API Routes
      app.get('/appointments', async (req, res) => {
        try {
          const { status, search } = req.query;
          
          let sql = `
            SELECT 
              a.id,
              a.patient_name,
              DATE_FORMAT(a.date, '%Y-%m-%d') as date,
              a.time,
              a.type,
              a.reason,
              a.status,
              a.notes,
              DATE_FORMAT(a.created_at, '%Y-%m-%d %H:%i:%s') as created_at
            FROM appointments a
            WHERE 1=1
          `;
          
          const params = [];
          
          if (status) {
            sql += ' AND a.status = ?';
            params.push(status);
          }
          
          if (search) {
            sql += ' AND (a.patient_name LIKE ? OR a.reason LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
          }
          
          sql += ' ORDER BY a.date ASC, a.time ASC';
          
          const results = await executeQuery(db, sql, params);
          res.json(results);
        } catch (err) {
          console.error('Error fetching appointments:', err);
          res.status(500).json({ message: 'Internal server error' });
        }
      });

      app.post('/appointments', async (req, res) => {
        try {
          const { patient_name, date, time, type, reason, notes } = req.body;
          
          // Validate required fields
          if (!patient_name || !date || !time || !type) {
            return res.status(400).json({ 
              message: 'Missing required fields',
              required: ['patient_name', 'date', 'time', 'type'],
              received: Object.keys(req.body)
            });
          }

          // Validate date format (YYYY-MM-DD)
          if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({ 
              message: 'Invalid date format',
              expected: 'YYYY-MM-DD',
              received: date
            });
          }

          const appointmentId = uuidv4();
          
          const sql = `
            INSERT INTO appointments 
              (id, patient_name, date, time, type, reason, notes, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled')
          `;
          
          const params = [
            appointmentId,
            patient_name,
            date,
            time,
            type,
            reason || null,
            notes || null
          ];

          await executeQuery(db, sql, params);

          // Retrieve the newly created appointment
          const [newAppointment] = await executeQuery(db, `
            SELECT 
              id,
              patient_name,
              DATE_FORMAT(date, '%Y-%m-%d') as date,
              time,
              type,
              reason,
              status,
              notes,
              DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at
            FROM appointments 
            WHERE id = ?
          `, [appointmentId]);
          
          return res.status(201).json(newAppointment);
        } catch (err) {
          console.error('Appointment creation error:', err);
          return res.status(500).json({ 
            message: 'Failed to create appointment',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
          });
        }
      });

      // Helper function
      function isValidDate(dateString) {
        return /^\d{4}-\d{2}-\d{2}$/.test(dateString);
      }

      app.put('/appointments/:id/status', async (req, res) => {
        try {
          const { id } = req.params;
          const { status } = req.body;
          
          if (!status || !['scheduled', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
          }
          
          const sql = `
            UPDATE appointments 
            SET status = ? 
            WHERE id = ?
          `;
          const result = await executeQuery(db, sql, [status, id]);
          
          if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Appointment not found' });
          }
          
          const [updatedAppointment] = await executeQuery(db, 
            `SELECT 
              id,
              patient_name,
              DATE_FORMAT(date, '%Y-%m-%d') as date,
              time,
              type,
              reason,
              status,
              notes,
              DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at
            FROM appointments WHERE id = ?`, 
            [id]
          );
          
          res.json(updatedAppointment);
        } catch (err) {
          console.error('Error updating appointment status:', err);
          res.status(500).json({ message: 'Internal server error' });
        }
      });

      app.get('/appointments/today', async (req, res) => {
        try {
          const today = new Date().toISOString().split('T')[0];
          
          const sql = `
            SELECT 
              a.id,
              a.patient_name,
              a.type as reason,
              DATE_FORMAT(a.date, '%Y-%m-%d') as date,
              a.time,
              a.status
            FROM appointments a
            WHERE a.date = ? AND a.status = 'scheduled'
            ORDER BY a.time ASC
            LIMIT 3
          `;
          
          const results = await executeQuery(db, sql, [today]);
          res.json(results);
        } catch (err) {
          console.error('Error fetching today\'s appointments:', err);
          res.status(500).json({ message: 'Internal server error' });
        }
      });

      // Medical Records routes
      app.get('/patients/:id/medical-records', async (req, res) => {
        try {
          const { id } = req.params;
          const sql = `
            SELECT 
              id,
              DATE_FORMAT(visit_date, '%Y-%m-%d') as visitDate,
              visit_type as visitType,
              weight,
              height,
              head_circumference as headCircumference,
              pulse,
              temperature,
              blood_pressure as bloodPressure,
              respiratory_rate as respiratoryRate,
              vaccine_name as vaccineName,
              child_age as childAge,
              vaccine_notes as vaccineNotes,
              well_child_notes as wellChildNotes,
              symptoms,
              diagnosis,
              treatment,
              prescribed_medications as prescribedMedications
            FROM medical_records 
            WHERE patient_id = ? 
            ORDER BY visit_date DESC
          `;
          const results = await executeQuery(db, sql, [id]);
          res.json(results);
        } catch (err) {
          console.error('Error fetching medical records:', err);
          res.status(500).json({ message: 'Internal server error' });
        }
      });

      app.post('/patients/:id/medical-records', async (req, res) => {
        try {
          const { id } = req.params;
          const recordData = req.body;
          
          // Validate required fields
          const requiredFields = [
            'visitDate', 'visitType', 'weight', 'height', 
            'headCircumference', 'pulse', 'temperature',
            'bloodPressure', 'respiratoryRate'
          ];
          
          const missingFields = requiredFields.filter(field => !recordData[field]);
          if (missingFields.length > 0) {
            return res.status(400).json({
              message: `Missing required fields: ${missingFields.join(', ')}`
            });
          }

          const recordId = uuidv4();
          
          const sql = `
            INSERT INTO medical_records (
              id, patient_id, visit_date, visit_type, weight, height, head_circumference,
              pulse, temperature, blood_pressure, respiratory_rate, vaccine_name,
              child_age, vaccine_notes, well_child_notes, symptoms, diagnosis,
              treatment, prescribed_medications
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          
          const values = [
            recordId, id, 
            recordData.visitDate,
            recordData.visitType,
            recordData.weight,
            recordData.height,
            recordData.headCircumference,
            recordData.pulse,
            recordData.temperature,
            recordData.bloodPressure,
            recordData.respiratoryRate,
            recordData.vaccineName || null,
            recordData.childAge || null,
            recordData.vaccineNotes || null,
            recordData.wellChildNotes || null,
            recordData.symptoms || null,
            recordData.diagnosis || null,
            recordData.treatment || null,
            recordData.prescribedMedications || null
          ];

          await executeQuery(db, sql, values);
          
          // Return the created record
          const [newRecord] = await executeQuery(db, `
            SELECT * FROM medical_records WHERE id = ?
          `, [recordId]);
          
          res.status(201).json(newRecord);
        } catch (err) {
          console.error('Error adding medical record:', err);
          res.status(500).json({ message: 'Internal server error' });
        }
      });

      // Start the server
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    });
    
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

// Start the initialization process
initializeDatabaseAndStartServer();