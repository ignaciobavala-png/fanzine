"use client";

import { MusicalNoteIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const stats = [
  { name: 'Total Canciones', value: '0', icon: MusicalNoteIcon, color: 'bg-purple-600' },
  { name: 'Total Artículos', value: '0', icon: DocumentTextIcon, color: 'bg-blue-600' },
];

export default function DashboardHome() {
  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Bienvenido al panel de administración de Substrato. Aquí puedes gestionar las canciones y artículos del fanzine.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6"
          >
            <dt>
              <div className={`absolute rounded-md ${stat.color} p-3`}>
                <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">{stat.name}</p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            </dd>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Acciones rápidas</h3>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <a
                href="/admin/tracks"
                className="block rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
              >
                <MusicalNoteIcon className="h-8 w-8 text-purple-600" />
                <h4 className="mt-2 text-sm font-medium text-gray-900">Agregar Canción</h4>
                <p className="mt-1 text-sm text-gray-500">Sube una nueva canción desde SoundCloud</p>
              </a>
              <a
                href="/admin/articles"
                className="block rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
              >
                <DocumentTextIcon className="h-8 w-8 text-blue-600" />
                <h4 className="mt-2 text-sm font-medium text-gray-900">Crear Artículo</h4>
                <p className="mt-1 text-sm text-gray-500">Escribe un artículo informativo</p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
