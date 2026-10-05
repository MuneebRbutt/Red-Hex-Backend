'use client';

import Link from 'next/link';
import { useState } from 'react';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/lib/cartContext';
import { getProductBySlug, MOCK_PRODUCTS } from '@/lib/mockProducts';

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  const { addItem, openSidebar } = useCart();
  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] ?? 'M');
  const [quantity, setQuantity] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);

  if (!product) {
    return (
      <main className="min-h-screen bg-black px-6 py-24 text-center text-white">
        <h1 className="font-heading text-4xl uppercase">Product not found</h1>
        <Link href="/" className="mt-6 inline-block text-brand-gold">Back to catalogue</Link>
      </main>
    );
  }

  const relatedProducts = MOCK_PRODUCTS
    .filter(item => item.category === product.category && item.slug !== product.slug)
    .slice(0, 4);

  const addToEnquiry = () => {
    addItem({
      id: `${product.slug}-${selectedSize}`,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: selectedSize,
      quantity,
      slug: product.slug,
    });
    openSidebar();
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="mx-auto flex max-w-7xl gap-2 px-6 py-5 text-xs tracking-wider text-zinc-500">
        <Link href="/" className="hover:text-white">HOME</Link>
        <span>/</span>
        <Link href={`/collections/${product.category}`} className="hover:text-white">PRODUCTS</Link>
        <span>/</span>
        <span className="truncate text-zinc-300">{product.name.toUpperCase()}</span>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-16 pt-6 lg:grid-cols-2 lg:gap-16">
        <div>
          <div className="relative aspect-[3/4] overflow-hidden border border-zinc-800 bg-zinc-950">
            <img
              src={product.images[imageIndex]}
              alt={product.name}
              className="h-full w-full object-contain"
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((image, index) => (
                <button key={image} onClick={() => setImageIndex(index)} className={`h-20 w-16 border ${index === imageIndex ? 'border-red-600' : 'border-zinc-800'}`}>
                  <img src={image} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col items-start justify-center">
          <p className="text-xs font-bold tracking-[0.3em] text-red-600">TANAURA / {product.category.replace(/-/g, ' ').toUpperCase()}</p>
          <h1 className="mt-4 font-heading text-4xl uppercase leading-tight md:text-5xl">{product.name}</h1>
          <p className="mt-6 max-w-xl text-sm leading-7 text-zinc-400">{product.description}</p>

          <div className="mt-8 w-full border-y border-zinc-800 py-6">
            <p className="text-xs font-bold tracking-widest text-zinc-400">SELECT SIZE</p>
            <div className="mt-3 flex gap-2">
              {product.sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-12 border px-4 py-2 text-sm font-bold ${selectedSize === size ? 'border-red-600 bg-red-600 text-white' : 'border-zinc-700 text-zinc-300 hover:border-zinc-400'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <span className="text-xs font-bold tracking-widest text-zinc-400">QUANTITY</span>
            <div className="flex border border-zinc-700">
              <button onClick={() => setQuantity(value => Math.max(1, value - 1))} className="px-4 py-2 text-lg">−</button>
              <span className="min-w-10 border-x border-zinc-700 py-2 text-center">{quantity}</span>
              <button onClick={() => setQuantity(value => Math.min(99, value + 1))} className="px-4 py-2 text-lg">+</button>
            </div>
          </div>

          <button onClick={addToEnquiry} className="mt-7 w-full bg-red-700 px-6 py-4 font-heading text-lg tracking-[0.16em] hover:bg-red-800">
            ADD TO ENQUIRY
          </button>
          <a
            href={`https://wa.me/923222993833?text=${encodeURIComponent(`Hello, I am interested in ${product.name}.`)}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 w-full border border-green-700 px-6 py-4 text-center text-sm font-bold tracking-wider text-green-400 hover:bg-green-950"
          >
            CHAT ON WHATSAPP
          </a>
          <p className="mt-5 text-xs leading-5 text-zinc-500">For bulk orders, custom colours, or branding, add products to your enquiry and send your requirements to Tanaura.</p>
        </div>
      </section>

      <section className="border-y border-zinc-900 bg-zinc-950 py-14">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-xs font-bold tracking-[0.25em] text-red-600">YOU MAY ALSO LIKE</p>
          <h2 className="mt-3 font-heading text-3xl uppercase">Related {product.category.replace(/-/g, ' ')}</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {relatedProducts.map(item => (
              <Link key={item.slug} href={`/products/${item.slug}`} className="border border-zinc-800 bg-black hover:border-red-700">
                <div className="aspect-[3/4] bg-white"><img src={item.images[0]} alt={item.name} className="h-full w-full object-contain" /></div>
                <p className="p-4 font-heading text-sm uppercase leading-tight">{item.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
