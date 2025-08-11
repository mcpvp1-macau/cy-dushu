import { lazy } from 'react'
import { RouteObject } from 'react-router'

const PageDocuments = lazy(() => import('@/pages/documents/Documents'))
const PageDocumentsTutorial = lazy(() => import('@/pages/documents/Tutorial'))
const PageDocumentsVideos = lazy(() => import('@/pages/documents/Videos'))
const PageDocumentsUpload = lazy(() => import('@/pages/documents/Upload'))

export default {
  id: 'documents',
  path: '/documents',
  element: <PageDocuments />,
  children: [
    {
      path: 'tutorial/:name',
      element: <PageDocumentsTutorial />,
    },
    {
      path: 'videos',
      element: <PageDocumentsVideos />,
    },
    {
      path: 'upload',
      element: <PageDocumentsUpload />,
    },
  ],
} as RouteObject
