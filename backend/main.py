from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, Float, func
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from pydantic import BaseModel
from typing import Optional, List

SECRET_KEY = "troque-esta-chave-em-producao"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 240

app = FastAPI(title="OmniPOS PRO API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = create_engine("sqlite:///./omnipos.db", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(80), unique=True, index=True, nullable=False)
    full_name = Column(String(120), default="")
    email = Column(String(120), default="")
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(30), default="admin")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    sku = Column(String(80), unique=True, index=True, nullable=False)
    barcode = Column(String(80), unique=True, index=True, nullable=True)
    category = Column(String(120), default="")
    cost_price = Column(Float, default=0.0)
    sale_price = Column(Float, default=0.0)
    stock = Column(Float, default=0.0)
    min_stock = Column(Float, default=0.0)
    image_url = Column(String(500), default="")
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Sale(Base):
    __tablename__ = "sales"
    id = Column(Integer, primary_key=True, index=True)
    total = Column(Float, default=0.0)
    payment_method = Column(String(30), default="cash")
    operator = Column(String(80), default="")
    created_at = Column(DateTime, default=datetime.utcnow)


class SaleItem(Base):
    __tablename__ = "sale_items"
    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, nullable=False)
    product_id = Column(Integer, nullable=False)
    product_name = Column(String(200), default="")
    quantity = Column(Float, default=1.0)
    unit_price = Column(Float, default=0.0)
    subtotal = Column(Float, default=0.0)


Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str):
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    payload = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    payload.update({"exp": expire})
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()


def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não autenticado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if not username:
            raise credentials_error
    except JWTError:
        raise credentials_error
    user = get_user_by_username(db, username)
    if not user:
        raise credentials_error
    return user


def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acesso negado")
    return current_user


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    username: str
    full_name: str
    email: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    username: str
    full_name: str = ""
    email: str = ""
    password: str
    role: str = "operator"
    is_active: bool = True


class ProductCreateFull(BaseModel):
    name: str
    sku: str
    barcode: Optional[str] = None
    category: Optional[str] = ""
    cost_price: float = 0.0
    sale_price: float = 0.0
    stock: float = 0.0
    min_stock: float = 0.0
    image_url: Optional[str] = ""


class SaleItemIn(BaseModel):
    product_id: int
    quantity: float
    unit_price: float
    subtotal: float
    product_name: str = ""


class SaleCreateIn(BaseModel):
    payment_method: str = "cash"
    operator: Optional[str] = ""
    items: List[SaleItemIn]


@app.on_event("startup")
def seed():
    db = SessionLocal()
    try:
        if not db.query(User).first():
            admin = User(
                username="admin",
                full_name="Administrador",
                email="admin@omnipos.local",
                hashed_password=hash_password("admin123"),
                role="admin",
                is_active=True,
            )
            db.add(admin)
            db.commit()
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "OmniPOS PRO API"}


@app.post("/api/auth/login", response_model=TokenOut)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Usuário ou senha inválidos")
    token = create_access_token({"sub": user.username, "role": user.role})
    return {"access_token": token, "token_type": "bearer"}


@app.get("/api/auth/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@app.get("/api/dashboard")
def dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total_products = db.query(Product).count()
    active_products = db.query(Product).filter(Product.active == True).count()
    low_stock = db.query(Product).filter(Product.stock <= Product.min_stock).count()
    total_sales = db.query(Sale).count()
    revenue = db.query(func.coalesce(func.sum(Sale.total), 0.0)).scalar() or 0.0
    return {
        "user": current_user.full_name or current_user.username,
        "total_products": total_products,
        "active_products": active_products,
        "low_stock": low_stock,
        "total_sales": total_sales,
        "revenue": revenue,
    }


@app.get("/api/products")
def list_products(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Product).order_by(Product.name.asc()).all()


@app.get("/api/products/full")
def products_full(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Product).order_by(Product.created_at.desc()).all()


@app.get("/api/products/categories")
def get_categories(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rows = db.query(Product.category).distinct().filter(Product.category.isnot(None)).all()
    return [r[0] for r in rows if r[0]]


@app.post("/api/products")
def create_product(
    product: ProductCreateFull,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    exists = db.query(Product).filter(
        (Product.sku == product.sku) | ((Product.barcode != None) & (Product.barcode == product.barcode))
    ).first()
    if exists:
        raise HTTPException(status_code=400, detail="SKU ou barcode já existe")
    p = Product(**product.dict())
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


@app.put("/api/products/{product_id}")
def update_product(
    product_id: int,
    product: ProductCreateFull,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    for k, v in product.dict().items():
        setattr(p, k, v)
    db.commit()
    db.refresh(p)
    return p


@app.delete("/api/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    db.delete(p)
    db.commit()
    return {"ok": True}


@app.get("/api/sales")
def list_sales(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Sale).order_by(Sale.created_at.desc()).all()


@app.get("/api/sales/items")
def list_sale_items(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(SaleItem).order_by(SaleItem.id.desc()).all()


@app.post("/api/sales")
def create_sale(
    sale: SaleCreateIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total = sum(item.subtotal for item in sale.items)
    s = Sale(total=total, payment_method=sale.payment_method, operator=sale.operator or current_user.username)
    db.add(s)
    db.commit()
    db.refresh(s)

    for item in sale.items:
        si = SaleItem(
            sale_id=s.id,
            product_id=item.product_id,
            product_name=item.product_name,
            quantity=item.quantity,
            unit_price=item.unit_price,
            subtotal=item.subtotal,
        )
        db.add(si)
        prod = db.query(Product).filter(Product.id == item.product_id).first()
        if prod:
            prod.stock = max(0, prod.stock - item.quantity)

    db.commit()
    return s


@app.get("/api/reports/summary")
def reports_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    products = db.query(Product).all()
    sales = db.query(Sale).all()
    revenue = sum(s.total for s in sales)
    low_stock_items = [
        {"id": p.id, "name": p.name, "stock": p.stock, "min_stock": p.min_stock}
        for p in products if p.stock <= p.min_stock
    ]
    by_payment = {}
    for s in sales:
        by_payment[s.payment_method] = by_payment.get(s.payment_method, 0) + 1
    return {
        "products_count": len(products),
        "sales_count": len(sales),
        "revenue": revenue,
        "low_stock_items": low_stock_items,
        "sales_by_payment": by_payment,
    }


@app.get("/api/users")
def list_users(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    return db.query(User).order_by(User.id.desc()).all()


@app.post("/api/users")
def create_user(payload: UserCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=400, detail="Usuário já existe")
    user = User(
        username=payload.username,
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=payload.role,
        is_active=payload.is_active,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.delete("/api/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    db.delete(user)
    db.commit()
    return {"ok": True}