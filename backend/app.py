from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import os
import json

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///app.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('SESSION_SECRET', 'your-secret-key-change-this')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

CORS(app, origins='*')
db = SQLAlchemy(app)
jwt = JWTManager(app)

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    ideas = db.relationship('Idea', foreign_keys='Idea.user_id', backref='user', lazy=True)

class Idea(db.Model):
    __tablename__ = 'ideas'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(50), default='pending')
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updates = db.relationship('Update', backref='idea', lazy=True, cascade='all, delete-orphan')

class Update(db.Model):
    __tablename__ = 'updates'
    id = db.Column(db.Integer, primary_key=True)
    idea_id = db.Column(db.Integer, db.ForeignKey('ideas.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user = db.relationship('User', backref='updates')

with app.app_context():
    db.create_all()

    # Create default owners
    owners_data = [
        {
            "name": "Jay Harish P",
            "email": "arishexim011@gmail.com",
            "phone": "+91 6381438102",
            "password": "Sriharish00u@"
        },
        {
            "name": "Srikanth L",
            "email": "lakshmansri032@gmail.com",
            "phone": "+91 93630 87370",
            "password": "srikanth0044"
        },
        {
            "name": "Gery Anton G",
            "email": "geryanton263@gmail.com",
            "phone": "+91 93613 10717",
            "password": "gery@93613"
        }
    ]
    for owner_data in owners_data:
        if not User.query.filter_by(email=owner_data['email']).first():
            owner = User(
                name=owner_data['name'],
                email=owner_data['email'],
                phone=owner_data.get('phone', ''),
                password=generate_password_hash(owner_data['password']),
                role='owner'
            )
            db.session.add(owner)
    db.session.commit()

    # Load customers from customers.json
    if os.path.exists('customers.json'):
        with open('customers.json', 'r') as f:
            customers_data = json.load(f)
            for customer_data in customers_data:
                if not User.query.filter_by(email=customer_data['email']).first():
                    customer = User(
                        name=customer_data['name'],
                        email=customer_data['email'],
                        phone=customer_data.get('phone', ''),
                        password=generate_password_hash(customer_data['password']),
                        role='customer'
                    )
                    db.session.add(customer)
            db.session.commit()

    # Load developers from developers.json
    if os.path.exists('developers.json'):
        with open('developers.json', 'r') as f:
            developers_data = json.load(f)
            for developer_data in developers_data:
                if not User.query.filter_by(email=developer_data['email']).first():
                    developer = User(
                        name=developer_data['name'],
                        email=developer_data['email'],
                        phone=developer_data.get('phone', ''),
                        password=generate_password_hash(developer_data['password']),
                        role='developer'
                    )
                    db.session.add(developer)
            db.session.commit()

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    requested_role = data.get('role', 'customer')
    if requested_role not in ['customer', 'developer']:
       return jsonify({'error': 'Invalid role. Only customer and developer roles are allowed for registration.'}), 400
    
    user = User(
        name=data['name'],
        email=data['email'],
        phone=data.get('phone', ''),
        password=generate_password_hash(data['password']),
        role=requested_role
    )

    db.session.add(user)
    db.session.commit()

    # Save to JSON file based on role
    json_file = f"{requested_role}s.json"
    if os.path.exists(json_file):
        with open(json_file, 'r') as f:
            users_data = json.load(f)
    else:
        users_data = []

    users_data.append({
        'name': data['name'],
        'email': data['email'],
        'phone': data.get('phone', ''),
        'password': data['password']  # Store plain password
    })

    with open(json_file, 'w') as f:
        json.dump(users_data, f, indent=4)
    
    access_token = create_access_token(identity={'id': user.id, 'role': user.role})
    
    return jsonify({
        'message': 'User registered successfully',
        'access_token': access_token,
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role
        }
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    access_token = create_access_token(identity={'id': user.id, 'role': user.role})
    
    return jsonify({
        'access_token': access_token,
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role
        }
    }), 200

@app.route('/api/ideas', methods=['GET', 'POST'])
@jwt_required()
def ideas():
    current_user = get_jwt_identity()
    
    if request.method == 'POST':
        if current_user['role'] != 'customer':
            return jsonify({'error': 'Only customers can submit ideas'}), 403
        
        data = request.get_json()
        idea = Idea(
            title=data['title'],
            description=data['description'],
            user_id=current_user['id']
        )
        db.session.add(idea)
        db.session.commit()
        
        return jsonify({
            'message': 'Idea submitted successfully',
            'idea': {
                'id': idea.id,
                'title': idea.title,
                'description': idea.description,
                'status': idea.status,
                'created_at': idea.created_at.isoformat()
            }
        }), 201
    
    if current_user['role'] == 'customer':
        ideas_list = Idea.query.filter_by(user_id=current_user['id']).all()
    elif current_user['role'] == 'developer':
        ideas_list = Idea.query.filter_by(assigned_to=current_user['id']).all()
    else:
        ideas_list = Idea.query.all()
    
    return jsonify([{
        'id': idea.id,
        'title': idea.title,
        'description': idea.description,
        'status': idea.status,
        'user_name': idea.user.name,
        'user_email': idea.user.email,
        'user_phone': idea.user.phone,
        'assigned_to': idea.assigned_to,
        'created_at': idea.created_at.isoformat(),
        'updated_at': idea.updated_at.isoformat()
    } for idea in ideas_list]), 200

@app.route('/api/ideas/<int:idea_id>', methods=['GET', 'PUT'])
@jwt_required()
def idea_detail(idea_id):
    current_user = get_jwt_identity()
    idea = Idea.query.get_or_404(idea_id)
    
    if request.method == 'GET':
        updates = Update.query.filter_by(idea_id=idea_id).order_by(Update.created_at.desc()).all()
        
        return jsonify({
            'id': idea.id,
            'title': idea.title,
            'description': idea.description,
            'status': idea.status,
            'user_name': idea.user.name,
            'user_email': idea.user.email,
            'user_phone': idea.user.phone,
            'assigned_to': idea.assigned_to,
            'created_at': idea.created_at.isoformat(),
            'updated_at': idea.updated_at.isoformat(),
            'updates': [{
                'id': update.id,
                'message': update.message,
                'user_name': update.user.name,
                'user_role': update.user.role,
                'created_at': update.created_at.isoformat()
            } for update in updates]
        }), 200
    
    if request.method == 'PUT':
        if current_user['role'] not in ['owner', 'developer']:
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.get_json()
        
        if 'status' in data:
            idea.status = data['status']
        
        if 'assigned_to' in data and current_user['role'] == 'owner':
            idea.assigned_to = data['assigned_to']
        
        db.session.commit()
        
        return jsonify({'message': 'Idea updated successfully'}), 200

@app.route('/api/ideas/<int:idea_id>/updates', methods=['POST'])
@jwt_required()
def add_update(idea_id):
    current_user = get_jwt_identity()
    idea = Idea.query.get_or_404(idea_id)
    
    data = request.get_json()
    update = Update(
        idea_id=idea_id,
        user_id=current_user['id'],
        message=data['message']
    )
    
    db.session.add(update)
    db.session.commit()
    
    return jsonify({'message': 'Update added successfully'}), 201

@app.route('/api/users', methods=['GET'])
@jwt_required()
def get_users():
    current_user = get_jwt_identity()
    
    if current_user['role'] != 'owner':
        return jsonify({'error': 'Unauthorized'}), 403
    
    users = User.query.all()
    return jsonify([{
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'role': user.role
    } for user in users]), 200

@app.route('/api/developers', methods=['GET'])
@jwt_required()
def get_developers():
    current_user = get_jwt_identity()
    
    if current_user['role'] != 'owner':
        return jsonify({'error': 'Unauthorized'}), 403
    
    developers = User.query.filter_by(role='developer').all()
    return jsonify([{
        'id': dev.id,
        'name': dev.name,
        'email': dev.email
    } for dev in developers]), 200

@app.route('/api/stats', methods=['GET'])
@jwt_required()
def get_stats():
    current_user = get_jwt_identity()
    
    if current_user['role'] == 'customer':
        ideas_count = Idea.query.filter_by(user_id=current_user['id']).count()
        pending = Idea.query.filter_by(user_id=current_user['id'], status='pending').count()
        in_progress = Idea.query.filter_by(user_id=current_user['id'], status='in_progress').count()
        completed = Idea.query.filter_by(user_id=current_user['id'], status='completed').count()
    elif current_user['role'] == 'developer':
        ideas_count = Idea.query.filter_by(assigned_to=current_user['id']).count()
        pending = Idea.query.filter_by(assigned_to=current_user['id'], status='pending').count()
        in_progress = Idea.query.filter_by(assigned_to=current_user['id'], status='in_progress').count()
        completed = Idea.query.filter_by(assigned_to=current_user['id'], status='completed').count()
    else:
        ideas_count = Idea.query.count()
        pending = Idea.query.filter_by(status='pending').count()
        in_progress = Idea.query.filter_by(status='in_progress').count()
        completed = Idea.query.filter_by(status='completed').count()
    
    return jsonify({
        'total': ideas_count,
        'pending': pending,
        'in_progress': in_progress,
        'completed': completed
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
