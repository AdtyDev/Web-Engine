"""
Pydantic v2 models that define the config schema contract.
This is the single source of truth — frontend and backend are both written against this shape.
"""
from __future__ import annotations
from typing import Literal
from pydantic import BaseModel


# ---------------------------------------------------------------------------
# Sub-models
# ---------------------------------------------------------------------------

class MetaConfig(BaseModel):
    business_name: str = ""
    business_type: Literal["clinic", "restaurant", "gym", "salon", "other"] = "other"
    tagline: str = ""
    logo_url: str = ""
    favicon_url: str = ""


class SeoConfig(BaseModel):
    title: str = ""
    description: str = ""
    keywords: list[str] = []
    og_image: str = ""


class ThemeConfig(BaseModel):
    primary_color: str = "#2563eb"
    secondary_color: str = "#64748b"
    accent_color: str = "#f59e0b"
    font_heading: str = "Inter"
    font_body: str = "Inter"
    border_radius: Literal["sm", "md", "lg", "full"] = "md"


class ContactHours(BaseModel):
    day: str
    time: str


class SocialLinks(BaseModel):
    facebook: str | None = None
    instagram: str | None = None
    whatsapp: str | None = None


class ContactConfig(BaseModel):
    phone: str = ""
    email: str = ""
    address: str = ""
    map_embed_url: str = ""
    hours: list[ContactHours] = []
    social: SocialLinks = SocialLinks()


class NavItem(BaseModel):
    label: str
    section: str


# ---------------------------------------------------------------------------
# Section sub-models
# ---------------------------------------------------------------------------

class HeroSection(BaseModel):
    enabled: bool = False
    headline: str = ""
    subheadline: str = ""
    cta_text: str = ""
    cta_link: str = ""
    background_image: str = ""


class AboutStat(BaseModel):
    label: str
    value: str


class AboutSection(BaseModel):
    enabled: bool = False
    title: str = ""
    body: str = ""
    image: str = ""
    stats: list[AboutStat] = []


class OfferingItem(BaseModel):
    id: str
    name: str
    description: str | None = None
    price: float | None = None
    currency: str = "INR"
    image: str | None = None
    icon: str | None = None
    featured: bool = False


class OfferingsSection(BaseModel):
    enabled: bool = False
    title: str = ""
    type: Literal["services", "menu", "programs"] = "services"
    items: list[OfferingItem] = []


class GallerySection(BaseModel):
    enabled: bool = False
    title: str = ""
    images: list[str] = []


class TeamMember(BaseModel):
    name: str
    role: str
    photo: str = ""
    bio: str = ""


class TeamSection(BaseModel):
    enabled: bool = False
    title: str = ""
    members: list[TeamMember] = []


class TestimonialItem(BaseModel):
    name: str
    text: str
    rating: int = 5


class TestimonialsSection(BaseModel):
    enabled: bool = False
    title: str = ""
    items: list[TestimonialItem] = []


class PricingPlan(BaseModel):
    id: str
    name: str
    price: float
    currency: str = "INR"
    period: str = "month"
    description: str = ""
    features: list[str] = []
    featured: bool = False


class PricingSection(BaseModel):
    enabled: bool = False
    title: str = ""
    plans: list[PricingPlan] = []


class FaqItem(BaseModel):
    q: str
    a: str


class FaqSection(BaseModel):
    enabled: bool = False
    title: str = ""
    items: list[FaqItem] = []


class ContactSection(BaseModel):
    enabled: bool = False
    title: str = ""
    show_form: bool = True
    show_map: bool = True


class Sections(BaseModel):
    hero: HeroSection | None = None
    about: AboutSection | None = None
    offerings: OfferingsSection | None = None
    gallery: GallerySection | None = None
    team: TeamSection | None = None
    testimonials: TestimonialsSection | None = None
    pricing: PricingSection | None = None
    faq: FaqSection | None = None
    contact: ContactSection | None = None


class Features(BaseModel):
    booking_enabled: bool = False
    newsletter_enabled: bool = False
    blog_enabled: bool = False


# ---------------------------------------------------------------------------
# Root model
# ---------------------------------------------------------------------------

class ClientConfig(BaseModel):
    client_id: str
    meta: MetaConfig = MetaConfig()
    seo: SeoConfig = SeoConfig()
    theme: ThemeConfig = ThemeConfig()
    contact: ContactConfig = ContactConfig()
    navigation: list[NavItem] = []
    sections: Sections = Sections()
    features: Features = Features()
