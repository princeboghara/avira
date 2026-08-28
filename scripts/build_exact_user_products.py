import re
import json

raw_input = """
[Choco Brain Powder](https://aviralifecare.com/user/product-detail/eyJpdiI6Im9VbnZxY3NBKzJxNHdST1JYZ1NIaVE9PSIsInZhbHVlIjoiRzdlU3NvalhWSkppQjBEZ08wNUc1UT09IiwibWFjIjoiZGVlOWVkNzYwNWFkNjA4ZWZjMzY4MmQxYTAyYWQ5ZjNhZGMwNzE2MzM3YjZjNzFmZjI3NjQ4ZmUzODYwNmIzZCIsInRhZyI6IiJ9)₹599PV : 100
[Pineapple Energy Booster](https://aviralifecare.com/user/product-detail/eyJpdiI6IkZMRHRLSlF5YmpUOCtlWUF0K1Qvemc9PSIsInZhbHVlIjoiUjZ6cGVidVJwT01YR3BhVFVmM2JOUT09IiwibWFjIjoiMzVmNDllZWI5YWY0ZDUzNDBjNjY5Yjk2ZWVmY2I5MjcwY2E1MjBlNzg4YzU1YWQwYTJhNDk0ZTdmMjEwZDMwNyIsInRhZyI6IiJ9)₹599PV : 100
[Protein Powder](https://aviralifecare.com/user/product-detail/eyJpdiI6Ii8zS1FkajVGN3NienJ3NXpkQTBqaFE9PSIsInZhbHVlIjoiZjMzL1ZZWmd0U2tnRGNXaThPUG1mUT09IiwibWFjIjoiYmMzNTcwNTUwZGRjYzc2YjU0NzQxMzdlNmJhOGViM2IxMjg1NmNmNDFmY2ExZmNmM2I3Y2Q1ODI1M2RiZGYzYiIsInRhZyI6IiJ9)₹799PV : 130
[JEEVAN AMRUT DROPS](https://aviralifecare.com/user/product-detail/eyJpdiI6ImNLclBqeVBuUXZVVDFzNjJuOG14Ync9PSIsInZhbHVlIjoiNjVUZWNHR0FWR0ZSQnAxeXowaGdkQT09IiwibWFjIjoiMDdiZDZhMjU2NjI3ZjBhMjRhYmViZjYyYTNlOTUyYjM2MGRiNmIzMWZmN2NlNGFlN2E1NTdiZTMwMDJjN2E5YiIsInRhZyI6IiJ9)₹599PV : 100
[ONION HAIR OIL](https://aviralifecare.com/user/product-detail/eyJpdiI6Ijk0bkUrd0NTV1p1Ym9ReVlYWE5VR0E9PSIsInZhbHVlIjoibnZiT0V6NFpodVFFRE5ZRHQ3OUlmZz09IiwibWFjIjoiNDJkNzIxZWI1ZWFjMDhhNDQ0OGMzNjcxMjk1MzFiN2M1MWFhYjg3MzQyZTc0OTliZWRkZGI1MDg1ZGQ2ZmZiMSIsInRhZyI6IiJ9)₹399PV : 50
[34 HERB HAIR OIL](https://aviralifecare.com/user/product-detail/eyJpdiI6ImpESUtpRllOVCtUc3lGc2pSa3kra0E9PSIsInZhbHVlIjoieU03WmtGMFRCYWxzVzBONDZqMlAzZz09IiwibWFjIjoiYTA0YTljMDllNmVjMDJkOGNjZGQwYzI4NTgwMTRlMTRmZjRkZmQ4NGI0MjgwZGJlNTMwNWFkMDNkODkxMjA0MSIsInRhZyI6IiJ9)₹499PV : 90
[BLACK MAHENDI](https://aviralifecare.com/user/product-detail/eyJpdiI6IldKS3hvUnFpTkJ1M2RsS1NHWG5Memc9PSIsInZhbHVlIjoiS2VxK2pveFptdklpakVxRnhwL1VkQT09IiwibWFjIjoiMWY2NWZmODY0NDM3OTVhYjcyMDMwOWQ3ZDMwZTU0YWEyZDcxYzNhMGZhODQ4ODRlZjUxY2Q3ZDA3ZDI3YWNmYyIsInRhZyI6IiJ9)₹120PV : 15
[BROWN MAHENDI](https://aviralifecare.com/user/product-detail/eyJpdiI6InhCV2tGZUhDT2JNWUNRTEw3TWpya3c9PSIsInZhbHVlIjoiKzhtNFM4M2Y5ZjdQRmNTblRveUVDdz09IiwibWFjIjoiOTc5YmI1NWU1MTBhODMwMjE2Y2EzNmY1OWU1MjI3MGJjYmRjOGFhZGYzMzVhMDU5YmZhY2YyYzMzNzEzZWU4NiIsInRhZyI6IiJ9)₹120PV : 15
[AVIRA DE ADDICTION](https://aviralifecare.com/user/product-detail/eyJpdiI6IklrWk92c2d0a1JpWUZxMnMvbHUvckE9PSIsInZhbHVlIjoiam50ajQwSm5kOXFLb2FTOU5XbXdHQT09IiwibWFjIjoiZmZkMmJkNDNkZGRiYmQ3N2RmNDZjNmY4MTEyMzRhMjc1ODIzZTRkYWYzOWNkNGE1YTA1ZTAzOGZiNTlkMmQwNiIsInRhZyI6IiJ9)₹999₹799PV : 125
[5 IN 1 FACH WASH](https://aviralifecare.com/user/product-detail/eyJpdiI6InpLV1JRSkF1VlZsZjdlV3dDY2Era0E9PSIsInZhbHVlIjoiUGlDUmwySEwwem05ZWYvaStGTWtHZz09IiwibWFjIjoiMWFjNGM0NThlNjJkYjBlMTIwNzQ4YTY4ZWMyNWVlZmQxYWI1YWU3OTczOWIyNGNhMTc0NzgwNzBmOGQ4MjZiYSIsInRhZyI6IiJ9)₹299PV : 30
[Premium Tea Leaves](https://aviralifecare.com/user/product-detail/eyJpdiI6Im5vNGEvU0VqQm5iYWdSY1NKZUE4WFE9PSIsInZhbHVlIjoiZzZjWWpuV1VOalV1OUpRMVpuYlh0UT09IiwibWFjIjoiMDk4OTA2Mjg4ZTA1NjVkMGM0ZGYxYjRiNGJmNTJlM2E3YmI3MTcwNDIxNzg4NmI1YWRhNzJiM2UwNThkNTdiNSIsInRhZyI6IiJ9)₹349PV : 40
[NIACINAMIDE FACE WASH](https://aviralifecare.com/user/product-detail/eyJpdiI6InpkODRWb2JheDdlSXA5WkNWLzJ4T0E9PSIsInZhbHVlIjoiUXJERnNyc0VuY1hhc3FTay9JNnBDdz09IiwibWFjIjoiMTY5YjAzODM0ZGViNmYyMTU1MTIxNDZjZWMyM2M3M2ExMzRhNWIyZGY5OTNjZjk1ZWE2OGViMTA5OWU2NGZmYSIsInRhZyI6IiJ9)₹399PV : 55
[12 products Combo | 4999/-](https://aviralifecare.com/user/product-detail/eyJpdiI6ImpVVjdBWEtJb0tKcVpyVVpCeUNFR3c9PSIsInZhbHVlIjoiNUtjODJUdVlDNi9IUURTc1JMdktrdz09IiwibWFjIjoiZDE5N2ZkMmMxMzMzNjQ1NTNiOWUzMzEwMzA4ZTZiNGVlNmIwMzA1MDg2MTcwY2MxMDA2MmJmNzYyYTllM2FlNCIsInRhZyI6IiJ9)₹4999PV : 1,000
[Multi Vitamin Combo | 4500/-](https://aviralifecare.com/user/product-detail/eyJpdiI6IkZzT3Y1b2RrZ2I2Nyt5UStqKzZPZEE9PSIsInZhbHVlIjoicXl1dHEvZG8vNnR5cjc2RlZQbEVPUT09IiwibWFjIjoiMzE5NjE5ZTQwYzA2N2ZmMGE1ZjNmMmYyMDA1OTA0NzhkZDgxMDE5MGI5ZjczYTcyNjIyNzQ1Y2MzYjRlOTkxMSIsInRhZyI6IiJ9)₹6000₹4500PV : 1,000
[MILKY SHAMPOO](https://aviralifecare.com/user/product-detail/eyJpdiI6InYrMVhZYU5wVlJ2U2FaNVRiVFh3RkE9PSIsInZhbHVlIjoiVFI1U3RkOHVxZXI3ZEVRUENWODJZdz09IiwibWFjIjoiZDFlMjYxMGUzYzAwYzQ5OTI3NTgwZDhkOTg0NjRhYjZiYjM5Y2JiNDgxOWVkODY3OTZkZjM3Yzg1YTczMzVjYyIsInRhZyI6IiJ9)₹499PV : 100
[TEA TREE SHAMPOO](https://aviralifecare.com/user/product-detail/eyJpdiI6ImVpQ3BhWmJIZzZKWm81aE1tWHRGZUE9PSIsInZhbHVlIjoiZGxoZ3NBekx3TFNicmFpbnJyYWtVdz09IiwibWFjIjoiZDJhNGY0ZjZhN2NiNDhjYmFjZWYyYzkxNjViZjdjYzk1YWRiZDlmM2E5NGJkNWNkZGExNGJmMDNkMWY0YzZjNiIsInRhZyI6IiJ9)₹399PV : 50
[NEEM SOAP](https://aviralifecare.com/user/product-detail/eyJpdiI6IktVZlB4ZmxoMjFhLy9HUndKVkU3Wnc9PSIsInZhbHVlIjoiVDNjYW9BMEJMWkVIVU5rU3Z3UmZUQT09IiwibWFjIjoiZGI1ZjAxOTJmNDJkYjM0ZTMwMTJmYmFmZWU4NjAxZjRkYzZjOTQ1NTZmYjZlYjQ3M2UwNzZjMDAyM2YzYzAyYiIsInRhZyI6IiJ9)₹99PV : 12
[SLEEPY SOAP](https://aviralifecare.com/user/product-detail/eyJpdiI6InhWV0hubWNxNGtJL2U5Q0tEd3cvU0E9PSIsInZhbHVlIjoiWGp5TExOSXR6NDVHL2QvYkZZRTNWZz09IiwibWFjIjoiNjNjNjIzZDRmMWYyN2I1NWQxMmM5Yjg5MmZhYWQ4Y2QwYmM3ZDY0N2Q0MjQzZTMwMzZhZDNlYmFkNzUwZTQwMCIsInRhZyI6IiJ9)₹99PV : 12
[ROSE SOAP](https://aviralifecare.com/user/product-detail/eyJpdiI6IlQwbEdUZXFDZktZSnYzaEFnSCttZnc9PSIsInZhbHVlIjoib1ZVaDgrNlMwZFBTd1BEVitsWjA2QT09IiwibWFjIjoiYTQ3YWFlMTdmOGYzMGEwMTc3ZDFlMzc4ZWVkMzYwOWYwYTY1OTJlOGU4Yjg5ODhmZWU1YjU4ODk3MTJkOTg1NiIsInRhZyI6IiJ9)₹99PV : 12
[LAVENDER SOAP](https://aviralifecare.com/user/product-detail/eyJpdiI6IlNKZ2RWQ3ZGOUVocEZnYXJzSHEyd0E9PSIsInZhbHVlIjoickJlOUc1RS9EU3pVNFNJWXR6OGd2dz09IiwibWFjIjoiMWIzYjEzMjI2NTIxZThjYmE2YzM1ZmNmYTk0OGU3ODRlMzUzNWY5YTEzOTYzY2M3ZjJiYmQ1MjdjMDNjZjFiMyIsInRhZyI6IiJ9)₹99PV : 12
[NIGHT CREAM](https://aviralifecare.com/user/product-detail/eyJpdiI6IlZoTTNEZlhuZGI5aXRaVDZxTEFUcGc9PSIsInZhbHVlIjoialYyRWdOVjdMM0hNa0gvY1F1Wk5aUT09IiwibWFjIjoiNDJjYjA0ZGU2ZGUwNzQ0NjljYTNhMDYzZjhkNmNkZjllYWUxMzU1OWJkMTkzZjgyMmRhMDEyMzAwNjcwOTkxMiIsInRhZyI6IiJ9)₹599PV : 100
[Women Special Powder](https://aviralifecare.com/user/product-detail/eyJpdiI6IjFtbFZoYllJN2tsRHY0U2xsUUN5WVE9PSIsInZhbHVlIjoiZ3dOVVdWVFBtUHl2VWluV3l2UzJ6QT09IiwibWFjIjoiOTRmOWFhYWJkZmVhZmE0N2E4NTBjN2UxMmU2MDBhOGFlYWJiZDQzOGQ0N2Q4NjA4ZTM1NTQxZmZkZDYyNmRjMiIsInRhZyI6IiJ9)₹799PV : 130
[24 Herbs Shampoo](https://aviralifecare.com/user/product-detail/eyJpdiI6IllpcS8zZEVyYXR1azc5RzN0Z1hsTFE9PSIsInZhbHVlIjoiaTE4eG1va0wrZ2tNVzVoVVlHWXRzUT09IiwibWFjIjoiMWVjYzIzYTI4ZGFlYmU5OTk2YzQyOWQ0NmZhN2IyM2FkMTYxNmJkNjA5MjdkMDQwNDI2NTE2ZjM0NTM2OGNmYyIsInRhZyI6IiJ9)₹499PV : 100
[Daily Moisturizing Body Wash](https://aviralifecare.com/user/product-detail/eyJpdiI6IlVLSEdOYk5hRlYxZFlXWE9yRE9hblE9PSIsInZhbHVlIjoiMFNNUE5GbzdUOVJWUk1xMjJvOVVzdz09IiwibWFjIjoiNWFkMWQ0OWUyOWQ5NzgxOTU0YzI0MjBiNWY3NmNjNzVlOTk3OWE5MzA3MjlkYmI5MWFhYmMwMGQ0ZDI1NjZmOCIsInRhZyI6IiJ9)₹499PV : 80
[Japanese Massage Cream](https://aviralifecare.com/user/product-detail/eyJpdiI6IkluU2ZIeFRJcWhQK2VFOEo3TFBlRHc9PSIsInZhbHVlIjoiWm9DVHJycmJ4MTJMNXp5b084c3VOZz09IiwibWFjIjoiMDFmNjRjM2NkZDkyOWIyZjE0ZTViNjA5YmNhZWU2NThjZWFiYzFmZDEyMGFmMjFiYTVmZWExM2M5NThjY2JmNyIsInRhZyI6IiJ9)₹199PV : 20
[Herbal Body Wax Powder](https://aviralifecare.com/user/product-detail/eyJpdiI6InBIRnloUmJvZlE1NWNsdERtWDZyZHc9PSIsInZhbHVlIjoiczI1NEROYUo4bVJrUkFDK1dGQkZoUT09IiwibWFjIjoiODYxNDYyNWViNjUwYzhhZmM2OGViOGE3ZWM4MWI0NDM5MDExZThkOTQzZTlkODUxZmRmMzA0MzY3ZDJmY2I5ZSIsInRhZyI6IiJ9)₹499PV : 100
[Neemadent Toothpaste](https://aviralifecare.com/user/product-detail/eyJpdiI6InBsNklnUVhvcmNHOE1zenpBcDlNT1E9PSIsInZhbHVlIjoibmZRWlFUN3RUdWZMbHJadTMydmFCZz09IiwibWFjIjoiMzhlZTYwYzMxZmYwNWI3OWIwMDJmOTNkODkyYjRiN2Q1MGU2ZjQ5Y2RiZjU2Y2MyOGU3N2RmYzYxYzQ4MGUzNCIsInRhZyI6IiJ9)₹175₹129PV : 15
[Avira Carbonx](https://aviralifecare.com/user/product-detail/eyJpdiI6InNkRGJ4SWsxODRPcGRxVmVMckxFSFE9PSIsInZhbHVlIjoiNFRPaTRYVEFhNDRITlR1UVZZRjRSdz09IiwibWFjIjoiZjA5NzRlODZmNTQzOWFlZDFjOTUyMjczYzdiMmRiYzc3OThkNGI4OTJmYzczNjY1NGFkZjgxYzJiZGI2ZTVlZSIsInRhZyI6IiJ9)₹799PV : 135
[Face Cleanser](https://aviralifecare.com/user/product-detail/eyJpdiI6InhOZ2VLVFhqbTNqMy9pUWNGN2JFUXc9PSIsInZhbHVlIjoiMTVKbTh5eEJHNFRIOEhxMjlRSEtLZz09IiwibWFjIjoiNjYwNzE3M2VlY2JjNjJkZjkzNDZmOGNiODA4NTZhMThiNWViMjcyOTdlZDIxZGFjNzg0MDA2YTQzZWFhOGI4OSIsInRhZyI6IiJ9)₹699PV : 110
[Multi Vitamin Capsule](https://aviralifecare.com/user/product-detail/eyJpdiI6InVwK2Q5RmNVOVhCREVyYS9qRm5ydGc9PSIsInZhbHVlIjoiQ1liR3JmcDRLa25JeURDa05WMmVDZz09IiwibWFjIjoiY2ZmZDVkYzFjNDc3ZDkyM2EzODczM2U0YmU4MGNjNjVmNzdlMmNlYjc4MDY2ZGUwYmQ1ZWJiYzFhOWJmNmJjNCIsInRhZyI6IiJ9)₹2000₹1499PV : 300
[Maxx Power Capsule](https://aviralifecare.com/user/product-detail/eyJpdiI6IjM1R1lLdDE1L2JEZWx4c3VKSW9pbUE9PSIsInZhbHVlIjoibDVwMVpKRzNmNjZkVjJudEZGNmV5UT09IiwibWFjIjoiNmU5MTljNWM4MmY1OGEzMTZiMTZjYWI1MjY2ZWM3MjRmZmE2OWNmOGFkY2U4OTRhNDViOGE5OWQzZWEyMzVjZCIsInRhZyI6IiJ9)₹2000₹1499PV : 300
[Diabetic Powder](https://aviralifecare.com/user/product-detail/eyJpdiI6IjA4cjVLWkczVHhQWXJWMmsrRlErZ1E9PSIsInZhbHVlIjoiMnBrb0NwaFQwaGxGTngzU3lrRGFqQT09IiwibWFjIjoiYTJjOGFjZjFiNTE0OWUxZDk4NjBmNjY3YWE0ODQwYjUxNDhkYzIyODcxNTg4ZmU5ZGNjYzBkNzZjMzZhYTE5OSIsInRhZyI6IiJ9)₹799PV : 105
[Green Tea Tablet](https://aviralifecare.com/user/product-detail/eyJpdiI6Ik5jMXZyOHFUY2R6aXlCcVJVUkZzbXc9PSIsInZhbHVlIjoib2hDVU5tYkZvckZ1SXoyRFE3WCtjQT09IiwibWFjIjoiNDg2MzY2MmQ0ZTYyMjE4MzlhNDkyM2U5ZWNhMzE0MWVjZmI2YzRkYmJkZTZmODExMjIzYjExZTY2Njc1Zjc3YiIsInRhZyI6IiJ9)₹799PV : 110
[Fat Loss Capsules](https://aviralifecare.com/user/product-detail/eyJpdiI6Ik1TaUYxYURnWlIxMzVqbzJwWHNoQ1E9PSIsInZhbHVlIjoiQUUzVGx2RllaV1JHU3kzZHhQU3VqZz09IiwibWFjIjoiODIxOWMxZjE4MDQ2NGY0ZDI5NGZmNjliNTQ0NWU5MmE0NTBiMTM0YTFiYTJiZGYyZTVjMzA4MjY1MTVhYzQ3NyIsInRhZyI6IiJ9)₹799PV : 110
[Detox Capsules](https://aviralifecare.com/user/product-detail/eyJpdiI6Im5BT1BCaU1DTnh1QTdzaytlQ0JPWmc9PSIsInZhbHVlIjoic1dPZVdlM1hRYTdMa0crZEJOK1g2UT09IiwibWFjIjoiNTUxMzE0YzI5YTIwMjJhMTUyYmM3ZDkyYWI5MTdkNWQzY2RmMTFmZDcxYWI3MzgzYzQ0MjZmM2I1ZDVlNjBmZiIsInRhZyI6IiJ9)₹599PV : 80
[sanitary napkins](https://aviralifecare.com/user/product-detail/eyJpdiI6ImJwKzlSWWhGWVNzL0FtV2pIQ2ttOEE9PSIsInZhbHVlIjoiUFg0L1NDYkJUdFdqaDBOSjdYTUZjdz09IiwibWFjIjoiZjY3MGE0ZjJjYWEzNGE5NzlkMGEyZDc4MDlmMTgxZGEyY2QwMDZkOGExMDE4ZGQ0YjNhNjgxNmJlODNkY2U5MCIsInRhZyI6IiJ9)₹125PV : 20
[FAMINOR JUICE](https://aviralifecare.com/user/product-detail/eyJpdiI6ImFNVlEyWlhsWWxkUkhsMU1sUG1iakE9PSIsInZhbHVlIjoicjhTeERKejl5bnQvYi9LeGEzNk9SUT09IiwibWFjIjoiZGI4MGIwZDBmMjY4MmRhMTg4MDgyMTAxMWQ3OTY3ZDMyYTk2MzVkMzgwY2NmNDVjMTIyOTc5ZDViNmQ1MWJhMyIsInRhZyI6IiJ9)₹1299PV : 200
[SEA BUCKTHORN JUICE](https://aviralifecare.com/user/product-detail/eyJpdiI6IlRpVzNDbnJ5UFowb2prWlI1bkhKMnc9PSIsInZhbHVlIjoiV0ovU01zOFU5K0MwYWpJdjRtLzBZdz09IiwibWFjIjoiYjFhOGI5NDZkODcwNDQ5OGVjZTM1ZGI0NzFmZGZjODlkNmM0NDA1YjcxY2VmM2RiMmYzMDAxZWM4OGIyOGRlMyIsInRhZyI6IiJ9)₹1799₹1299PV : 200
[Avira 82ST (100 ML)](https://aviralifecare.com/user/product-detail/eyJpdiI6Ikw4Ni9mR3pldjV0RFdNMWExVHlvM1E9PSIsInZhbHVlIjoib0srRjVET2FDVWVhanh2ZXErK2l5Zz09IiwibWFjIjoiYzkxOGMyM2JmMDMwY2JkNjE4NmY3NzY0OGEzNTMyNWMzZjFlMGI5NjUzYmUzNjNmZjI5MTVmZTE3Yzk1Y2JlOCIsInRhZyI6IiJ9)₹440PV : 40
[Avira 82ST (250ML)](https://aviralifecare.com/user/product-detail/eyJpdiI6ImRwMXIrZHFPOUhidGE5WXVCa3BLNkE9PSIsInZhbHVlIjoiUkwxRzBPTUVtdkNYcDNFUkNlanZrUT09IiwibWFjIjoiODcwYmE4NjUyZmEyNWUwNzFjY2MyZWYwNzJmM2Y1MWE0MGI3ZThlOWQzNjM3ZTAyNTNhNTk0ZmI2ZGZhZmIyYyIsInRhZyI6IiJ9)₹715PV : 80
[Avira Bloom + (100 ml)](https://aviralifecare.com/user/product-detail/eyJpdiI6Inh2K3NhbHRJWG5tU2g4aTdrYXBKZEE9PSIsInZhbHVlIjoiZjZwODJkSFluN1F0Vkk2RmppSWdlQT09IiwibWFjIjoiMzc5OGMyNWM2YjNjODY3ZjkxNTQ2MWNkY2VjNWI4MzQ5MWMyZDNiYWQ1N2QxN2UzYjMzNGZmNGE3NTdmMzYzZiIsInRhZyI6IiJ9)₹415PV : 40
[Avira Bloom + (250 ml)](https://aviralifecare.com/user/product-detail/eyJpdiI6InRVU2VMWE1UaE4xNzk5YmVrc2ZqM1E9PSIsInZhbHVlIjoiKytrWHlrN1JFRjZtd3FTRzFDTHl6dz09IiwibWFjIjoiMzc2OWJmODYxNzYyMTcyOWMzYjU5NzM1N2FlMWQxZDA1YTFjNjU1Mjk2Y2Q5NjcwZTVhOWZiYmZkZmYwZWUyNSIsInRhZyI6IiJ9)₹810PV : 100
[Plant Growth Promoter[250ML]](https://aviralifecare.com/user/product-detail/eyJpdiI6IlZBWFVHUHoxZTFBcDJMeEhNWVZSZFE9PSIsInZhbHVlIjoiMWFLZmR2NmRtaVBTc3VLZEplOTl4dz09IiwibWFjIjoiMmE5ZGY5OTQ4OGUzODM0OTUwNDlmODg0YmU5ZmFjMzQzMTJmNDNmOTVkODk3MzkwMWQ5Nzg0ZDQwYzQ4N2M1ZCIsInRhZyI6IiJ9)₹375PV : 40
[Bhumi Sanjivani](https://aviralifecare.com/user/product-detail/eyJpdiI6InhoSVRRZGJQTXBFTldtV1N6WmhzYkE9PSIsInZhbHVlIjoiZEdpRTFCQ3VtdDBueG80SkpBaEFnZz09IiwibWFjIjoiMDFlZDUxMWVhMDg1MTA3MzVmODQ4MjIzM2I4Yzg0OTFkOTk5MjRkNzE0MGE0NmFjN2E3MDc1ZTcyMjVmNGY1NyIsInRhZyI6IiJ9)₹625PV : 60
"""

lines = [l.strip() for l in raw_input.strip().split('\n') if l.strip()]

category_images = {
    'Health & Wellness': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800',
    'Hair Care': 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&q=80&w=800',
    'Personal Care & Skin': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800',
    'Oral Care': 'https://images.unsplash.com/photo-1559591937-e1032b4b455b?auto=format&fit=crop&q=80&w=800',
    'Beverages': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=800',
    'Women Care & Hygiene': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800',
    'Agriculture & Plant Care': 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=800',
    'Combo & Activation Packages': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800'
}

products = []
idx = 1

for line in lines:
    # Match: [Name](URL)Prices...PV : ...
    m = re.search(r'\[(.*?)\]\((.*?)\)(.*)', line)
    if not m:
        continue
    
    raw_name = m.group(1).strip()
    url = m.group(2).strip()
    rest = m.group(3).strip()
    
    # Skip test/empty items
    if raw_name in ['AVIRA .......', 'avira'] or '...' in raw_name:
        continue
        
    # Extract PV
    pv_match = re.search(r'PV\s*:\s*([\d,]+(?:\.\d+)?)', rest, re.IGNORECASE)
    pv = float(pv_match.group(1).replace(',', '')) if pv_match else 0.0
    
    # Extract Prices: find all numbers following ₹ or in the string before PV
    price_str = rest.split('PV')[0] if 'PV' in rest else rest
    prices = re.findall(r'₹\s*(\d+)', price_str)
    
    if len(prices) >= 2:
        mrp = float(prices[0])
        dp = float(prices[1])
    elif len(prices) == 1:
        mrp = float(prices[0])
        dp = float(prices[0])
    else:
        mrp = 0.0
        dp = 0.0
        
    # Standardize Name
    name = raw_name
    if not name.lower().startswith('avira'):
        name = f"Avira {name}"
    
    # Extract Volume if specified in name
    vol_match = re.search(r'[\(\[]\s*(\d+\s*(?:ml|gm|kg|tab|cap|pads|l))\s*[\)\]]', name, re.IGNORECASE)
    net_vol = vol_match.group(1) if vol_match else "1 Unit"
    
    name_lower = name.lower()
    
    # Auto Category & HSN Code
    if 'combo' in name_lower or 'package' in name_lower:
        category = 'Combo & Activation Packages'
        hsn = '998319' # Multi-product Combo Pack
    elif any(w in name_lower for w in ['82st', 'bloom', 'growth promoter', 'bhumi sanjivani', 'carbonx', 'plant']):
        category = 'Agriculture & Plant Care'
        if 'carbonx' in name_lower:
            hsn = '38021000'
        else:
            hsn = '31010099' # Organic Plant Growth & Soil Conditioners
    elif any(w in name_lower for w in ['capsule', 'tablet', 'powder', 'drink', 'booster', 'juice', 'de addiction', 'drops', 'amrut']):
        category = 'Health & Wellness'
        if any(w in name_lower for w in ['capsule', 'tablet', 'drops', 'amrut', 'de addiction', 'fat loss', 'detox', 'diabetic']):
            hsn = '30049011' # Ayurvedic / Herbal
        else:
            hsn = '21069099' # Nutritional & Energy Supplements
    elif any(w in name_lower for w in ['shampoo', 'hair oil', 'oil', 'mahendi']):
        category = 'Hair Care'
        if 'shampoo' in name_lower:
            hsn = '33051010'
        elif 'oil' in name_lower:
            hsn = '33059011'
        else:
            hsn = '33059040'
    elif any(w in name_lower for w in ['soap', 'face wash', 'body wash', 'cleanser', 'cream', 'wax', 'massage']):
        category = 'Personal Care & Skin'
        if 'soap' in name_lower:
            hsn = '34011110'
        elif any(w in name_lower for w in ['face wash', 'cleanser', 'cream']):
            hsn = '33049910'
        elif 'body wash' in name_lower:
            hsn = '34013011'
        else:
            hsn = '33079090'
    elif 'toothpaste' in name_lower:
        category = 'Oral Care'
        hsn = '33061010'
    elif 'tea' in name_lower:
        category = 'Beverages'
        hsn = '09024010'
    elif 'napkins' in name_lower or 'pad' in name_lower:
        category = 'Women Care & Hygiene'
        hsn = '96190010'
    else:
        category = 'General Wellness'
        hsn = '21069099'
        
    slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
    
    products.append({
        'id': f"prod_{slug}",
        'sn': idx,
        'name': name,
        'slug': slug,
        'net_quantity': net_vol,
        'mrp': mrp,
        'dp': dp,
        'discount_price': dp,
        'pv': pv,
        'category': category,
        'category_name': category,
        'hsn_code': hsn,
        'image_url': category_images.get(category, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800'),
        'description': f"Official Avira LifeCare premium {name}. Crafted with highest grade ingredients for optimal efficacy and results.",
        'stock': 500,
        'stock_quantity': 500,
        'in_stock': True,
        'is_active': True,
        'tag': 'Bestseller' if pv >= 100 else 'Popular'
    })
    idx += 1

print(f"Total Products Parsed: {len(products)}")
with open(r'D:\aviracare\avira\scripts\exact_user_products.json', 'w', encoding='utf-8') as f:
    json.dump(products, f, indent=2)

print("Saved to exact_user_products.json")
