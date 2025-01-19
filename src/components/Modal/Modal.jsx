/* eslint-disable react/prop-types */
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'

const Modal = ({ isOpen, onClose, title, content, header, btnName }) => {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className='bg-white rounded-lg w-[600px] shadow-lg'
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <div className='flex justify-between items-center border-b-2 border-slate-200 p-4'>
              <div className='text-lg font-bold'>{header}</div>
              <XMarkIcon className='h-6 w-6 cursor-pointer text-gray-400 hover:text-gray-800' onClick={onClose} />
            </div>

            <div className='p-4'>
              <h2 className='text-lg font-semibold mb-4'>{title}</h2>
              <div>{content}</div>
              <div className='mt-4 p-3 border-dashed border-2 border-slate-400 bg-gray-100 rounded'>
                Click on the map to mark points of the route and then press ⮌ to complete the route.
              </div>
            </div>

            <div className='border-t-2 border-slate-200 p-4 flex justify-end'>
              <button onClick={onClose} className='px-4 py-2 font-bold bg-indigo-600 text-white rounded'>
                {btnName}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Modal
